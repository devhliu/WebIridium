import { atom, type Getter } from "jotai";
import { atomWithLazy } from "jotai/utils";

import type {
  ParameterScanResult,
  SimulationResult,
  Simulator,
  Variable,
} from "@/features/simulation/Simulator";
import {
  getLinearDistribution,
  getLogarithmicDistribution,
} from "@/features/distribution";

import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";
import type { Setter } from "jotai";
import { editorContentAtom, modelStatusAtom, variablesAtom } from "./model";
import {
  independentVariableAtom,
  parameterScanOptionsAtom,
  timeCourseParametersAtom,
  variableSettingssAtom,
  type VariableSettings,
} from "./settings";

export type SimulationOperationResult =
  | { type: "success" }
  | { type: "failure"; message: string };

// internal atoms

const _isSimulatingAtom = atom(false);
const _simulationResultAtom = atom<SimulationResult | null>(null);
const _simulatorAtom = atomWithLazy<Simulator>(() => new CopasiSimulator());

// exported atoms

export const isSimulatingAtom = atom((get) => get(_isSimulatingAtom));
export const simulationResultAtom = atom((get) => get(_simulationResultAtom));
export const simulatorAtom = atom((get) => get(_simulatorAtom));

// exported simulation action atoms

const getIncludeVariableList = (
  variables: Variable[],
  variableSettingss: Record<string, VariableSettings>,
  usingIndependentVariable: string | null,
) => {
  return variables.filter(
    (v) =>
      v.name === usingIndependentVariable || variableSettingss[v.name]?.visible,
  );
};

const runSimulation = async (
  get: Getter,
  set: Setter,
  run: () => Promise<SimulationResult>,
): Promise<SimulationOperationResult> => {
  const modelStatus = get(modelStatusAtom);
  if (get(isSimulatingAtom)) {
    return { type: "failure", message: "Simulation already in progress." };
  } else if (modelStatus.type === "loading") {
    return {
      type: "failure",
      message: "Model is still loading. Please wait.",
    };
  } else if (modelStatus.type === "error") {
    return { type: "failure", message: "There is an error with your model." };
  } else {
    set(_isSimulatingAtom, true);

    try {
      const result = await run();
      set(_simulationResultAtom, result);
      return { type: "success" };
    } catch (err) {
      // console.error(err);

      return {
        type: "failure",
        message: err instanceof Error ? err.message : "Unknown error",
      };
    } finally {
      set(_isSimulatingAtom, false);
    }
  }
};

export const simulateTimeCourseAtom = atom(
  null,
  async (get, set, abortSignal?: AbortSignal) => {
    return await runSimulation(get, set, async () => {
      return await get(simulatorAtom).simulateTimeCourse(
        get(editorContentAtom),
        {
          parameters: {
            includeVariables: getIncludeVariableList(
              get(variablesAtom),
              get(variableSettingssAtom),
              get(independentVariableAtom),
            ),
            ...get(timeCourseParametersAtom),
          },
        },
        abortSignal,
      );
    });
  },
);

export const computeSteadyStateAtom = atom(
  null,
  async (get, set, abortSignal?: AbortSignal) => {
    return await runSimulation(get, set, async () => {
      return await get(simulatorAtom).computeSteadyState(
        get(editorContentAtom),
        {
          parameters: {},
        },
        abortSignal,
      );
    });
  },
);

export const runParameterScanAtom = atom(
  null,
  async (get, set, abortSignal?: AbortSignal) => {
    const simulator = get(simulatorAtom);
    const parameterScanOptions = get(parameterScanOptionsAtom);
    const variables = get(variablesAtom);
    const variableSettingss = get(variableSettingssAtom);
    const editorContent = get(editorContentAtom);

    return await runSimulation(get, set, async () => {
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

      if (parameterScanOptions.mode === "timeCourse") {
        const scanTimeCourseParameters = {
          includeVariables: getIncludeVariableList(
            variables,
            variableSettingss,
            simulator.scanIndependentVariableName,
          ),
          ...parameterScanOptions.timeCourseParameters,
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
            scanPercent: i / (scanValues.length - 1),
            ...result,
          });
        }

        return {
          type: "parameterScan",
          mode: "timeCourse",
          parameter,
          scans,
        } satisfies ParameterScanResult;
      } else {
        const resultPromises = [];
        for (const value of scanValues) {
          resultPromises.push(
            simulator.computeSteadyState(
              editorContent,
              {
                parameters: {},
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
            scanPercent: i / (scanValues.length - 1),
            concentrations: result.concentrations,
          });
        }

        return {
          type: "parameterScan",
          mode: "steadyState",
          parameter,
          scans,
        } satisfies ParameterScanResult;
      }
    });
  },
);

export const simulationAtoms = [
  _isSimulatingAtom,
  _simulationResultAtom,
  _simulatorAtom,

  isSimulatingAtom,
  simulationResultAtom,
  simulatorAtom,

  simulateTimeCourseAtom,
  computeSteadyStateAtom,
  runParameterScanAtom,
];
