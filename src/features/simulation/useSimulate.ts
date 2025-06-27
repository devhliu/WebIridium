import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type {
  ParameterScanResult,
  SimulationResult,
} from "@/features/simulation/Simulator";

import {
  variablesAtom,
  editorContentAtom,
  isSimulatingAtom,
  simulationResultAtom,
  timeCourseParametersAtom,
  parameterScanOptionsAtom,
  independentVariableAtom,
} from "@/stores/workspace";
import { useSimulator } from "@/features/workspace.tsx";

export type SimulationOperationResult =
  | { type: "success" }
  | { type: "failure"; message: string };

/**
 * Hook for simulation capabilities. Handles all the required state
 * management for running simulations.
 *
 * @returns object with:
 * - `isSimulating` - whether a simulation is currently running
 * - `simulateTimeCourse` - start a time course simulation. Accepts an abort signal.
 * - `computeSteadyState` - compute the steady state. Accepts an abort signal.
 * - `runParameterScan` - run a parameter scan. Accepts an abort signal.
 */
export const useSimulate = () => {
  const simulator = useSimulator();
  const independentVariable = useAtomValue(independentVariableAtom);
  const variables = useAtomValue(variablesAtom);
  const editorContent = useAtomValue(editorContentAtom);
  const setSimulationResult = useSetAtom(simulationResultAtom);
  const timeCourseParameters = useAtomValue(timeCourseParametersAtom);
  const parameterScanOptions = useAtomValue(parameterScanOptionsAtom);
  const [isSimulating, setIsSimulating] = useAtom(isSimulatingAtom);

  /**
   * @param usingIndependentVariable - The independent variable to be used when getting variables to include.
   *                                   This exists because parameter scan must always use Time as its independent
   *                                   variable.
   * @returns a list of variables to include in a simulation result
   */
  const getIncludeVariableList = (usingIndependentVariable: string | null) => {
    return variables.filter(
      (v) => v.name === usingIndependentVariable || v.visible,
    );
  };

  const runSimulation = async (
    run: () => Promise<SimulationResult>,
  ): Promise<SimulationOperationResult> => {
    if (isSimulating) {
      return { type: "failure", message: "simulation already in progress" };
    } else {
      setIsSimulating(true);

      try {
        const result = await run();
        setSimulationResult(result);
        return { type: "success" };
      } catch (err) {
        // console.error(err);

        return {
          type: "failure",
          message: err instanceof Error ? err.message : "Unknown error",
        };
      } finally {
        setIsSimulating(false);
      }
    }
  };

  const simulateTimeCourse = async (
    abortSignal?: AbortSignal,
  ): Promise<SimulationOperationResult> => {
    return await runSimulation(async () => {
      return await simulator.simulateTimeCourse(
        editorContent,
        {
          parameters: {
            includeVariables: getIncludeVariableList(independentVariable),
            ...timeCourseParameters,
          },
        },
        abortSignal,
      );
    });
  };

  const computeSteadyState = async (
    abortSignal?: AbortSignal,
  ): Promise<SimulationOperationResult> => {
    return await runSimulation(async () => {
      return await simulator.computeSteadyState(
        editorContent,
        {
          timeCourseParameters: {
            includeVariables: getIncludeVariableList(independentVariable),
            ...timeCourseParameters,
          },
        },
        abortSignal,
      );
    });
  };

  const runParameterScan = async (abortSignal?: AbortSignal) => {
    return await runSimulation(async () => {
      const parameter = parameterScanOptions.varyingParameter;
      if (!parameter) {
        throw new Error("select parameter to scan with");
      }

      const resultPromises = [];
      const getDistribution = parameterScanOptions.useLogarithmicDistribution
        ? getLogarithmicDistribution
        : getLinearDistribution;
      const scanValues = getDistribution(
        parameterScanOptions.min,
        parameterScanOptions.max,
        parameterScanOptions.numberOfValues,
      );

      const scanTimeCourseParameters = {
        includeVariables: getIncludeVariableList(
          simulator.scanIndependentVariableName,
        ),
        ...timeCourseParameters,
      };

      for (const value of scanValues) {
        resultPromises.push(
          simulator.simulateTimeCourse(
            editorContent,
            {
              parameters: scanTimeCourseParameters,
              parameterScanOptions: {
                varyingParameter: parameter,
                varyingParameterValue: value,
              },
            },
            abortSignal,
          ),
        );
      }

      const results = await Promise.all(resultPromises);
      const scans = [];
      for (const [i, result] of results.entries()) {
        scans.push({
          parameterValue: scanValues[i],
          ...result,
        });
      }

      return {
        type: "parameterScan",
        method: "timeCourse",
        parameter: parameter,
        scans,
      } satisfies ParameterScanResult;
    });
  };

  return {
    isSimulating,
    simulateTimeCourse,
    computeSteadyState,
    runParameterScan,
  };
};

export const getLinearDistribution = (
  min: number,
  max: number,
  numberOfValues: number,
): number[] => {
  const list = [];
  const stepSize = (max - min) / (numberOfValues - 1);
  for (let i = 0; i < numberOfValues; i++) {
    list.push(min + i * stepSize);
  }
  return list;
};

export const getLogarithmicDistribution = (
  min: number,
  max: number,
  numberOfValues: number,
): number[] => {
  const list = [];

  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const logStepSize = (logMax - logMin) / (numberOfValues - 1);

  for (let i = 0; i < numberOfValues; i++) {
    const logValue = logMin + i * logStepSize;
    list.push(Math.pow(10, logValue));
  }

  return list;
};
