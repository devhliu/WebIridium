import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { SimulationResult } from "@/stores/workspace.tsx";

import {
  editorContentAtom,
  isSimulatingAtom,
  simulationResultAtom,
  timeCourseParametersAtom,
  parameterScanParametersAtom,
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
  const editorContent = useAtomValue(editorContentAtom);
  const setSimulationResult = useSetAtom(simulationResultAtom);
  const timeCourseParameters = useAtomValue(timeCourseParametersAtom);
  const parameterScanParameters = useAtomValue(parameterScanParametersAtom);
  const [isSimulating, setIsSimulating] = useAtom(isSimulatingAtom);

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
        // TODO: implement error handling
        return {
          type: "failure",
          message: "Unexpected error while simulating.",
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
      const result = await simulator.simulateTimeCourse(
        editorContent,
        { parameters: timeCourseParameters },
        abortSignal,
      );
      return {
        type: "timeCourse",
        titles: result.titles,
        columns: result.columns,
      };
    });
  };

  const computeSteadyState = async (
    abortSignal?: AbortSignal
  ): Promise<SimulationOperationResult> => {
    return await runSimulation(async () => {
      const result = await simulator.computeSteadyState(
        editorContent,
        { parameters: timeCourseParameters },
        abortSignal,
      );

      console.log(result);

      // return empty results
      return {
        type: "steadyState",
        data: result,
      };
    });
  };

  const runParameterScan = async (abortSignal?: AbortSignal) => {
    return await runSimulation(async () => {
      const parameter = parameterScanParameters.varyingParameter;
      if (!parameter) {
        throw new Error("select parameter to scan with");
      }

      const resultPromises = [];
      const getDistribution = parameterScanParameters.useLogarithmicDistribution
        ? getLogarithmicDistribution
        : getLinearDistribution;
      const scanValues = getDistribution(
        parameterScanParameters.min,
        parameterScanParameters.max,
        parameterScanParameters.numberOfValues,
      );

      for (const value of scanValues) {
        resultPromises.push(
          simulator.simulateTimeCourse(
            editorContent,
            {
              parameters: timeCourseParameters,
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
          value: scanValues[i],
          titles: result.titles,
          columns: result.columns,
        });
      }

      return {
        type: "parameterScan",
        scans,
        parameter: parameter,
      };
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
