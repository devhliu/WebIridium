import { atom, type Getter } from "jotai";

import type {
  ParameterScanResult,
  SimulationResult,
  Simulator,
} from "@/features/simulation/Simulator";
import {
  getLinearDistribution,
  getLogarithmicDistribution,
} from "@/features/distribution";

import type { Setter } from "jotai";
import { editorContentAtom, modelStatusAtom, variablesAtom } from "./model";
import {
  independentVariableAtom,
  parameterScanOptionsAtom,
  timeCourseParametersAtom,
  variableSettingssAtom,
} from "./settings";
import { WorkerTermination } from "@/features/workerPool";
import { variableSliderStatesAtom, type VariableSliderState } from "./slider";

export type SimulationOperationResult =
  | { type: "success" }
  | { type: "cancel" }
  | { type: "failure"; message: string };

// internal atoms

type SimulationInternalState = {
  type: string;
  abortController: AbortController;
};

const _simulationResultAtom = atom<SimulationResult | null>(null);
const _simulatorAtom = atom<Simulator>({} as Simulator);
const _simulationInternalStateAtom = atom<SimulationInternalState | null>(null);

// exported atoms

export const simulationResultAtom = atom((get) => get(_simulationResultAtom));
export const simulatorAtom = atom((get) => get(_simulatorAtom));
export const updateSimulatorAtom = atom(
  null,
  (_, set, simulator: Simulator) => {
    set(_simulatorAtom, simulator);
  },
);
export const isSimulatingAtom = atom((get) =>
  Boolean(get(_simulationInternalStateAtom)),
);

// exported simulation action atoms

const getVariableValues = (
  sliderStates: Record<string, VariableSliderState>,
) => {
  return Object.entries(sliderStates).reduce(
    (acc, [name, state]) => ({
      ...acc,
      [name]: state.value,
    }),
    {},
  );
};

const runSimulation = async (
  simulationType: string,
  get: Getter,
  set: Setter,
  run: (abortSignal: AbortSignal) => Promise<SimulationResult>,
): Promise<SimulationOperationResult> => {
  const modelStatus = get(modelStatusAtom);
  if (modelStatus.type === "loading") {
    return {
      type: "failure",
      message: "Model is still loading. Please wait.",
    };
  } else if (modelStatus.type === "error") {
    return { type: "failure", message: modelStatus.message };
  } else {
    // cancel the current simulaton if any
    const prevInternalState = get(_simulationInternalStateAtom);
    if (prevInternalState) {
      prevInternalState.abortController.abort();
    }

    const abortController = new AbortController();
    set(_simulationInternalStateAtom, {
      type: simulationType,
      abortController,
    });

    try {
      const result = await run(abortController.signal);
      set(_simulationResultAtom, result);
      return { type: "success" };
    } catch (err) {
      if (err instanceof WorkerTermination) {
        return { type: "cancel" };
      } else {
        if (err instanceof Error && err.message !== "mock fail") {
          console.error(err);
        }

        return {
          type: "failure",
          message: err instanceof Error ? err.message : "Unknown error",
        };
      }
    } finally {
      if (
        get(_simulationInternalStateAtom)?.abortController === abortController
      ) {
        set(_simulationInternalStateAtom, null);
      }
    }
  }
};

export const simulateTimeCourseAtom = atom(null, async (get, set) => {
  return await runSimulation(
    "timeCourse",
    get,
    set,
    async (abortSignal: AbortSignal) => {
      const variables = get(variablesAtom);
      const variableSettings = get(variableSettingssAtom);
      const independentVariable = get(independentVariableAtom);
      return await get(simulatorAtom).simulateTimeCourse(
        get(editorContentAtom),
        {
          parameters: {
            ...get(timeCourseParametersAtom),
            includedVariables: variables.filter(
              (v) =>
                v.name !== independentVariable &&
                variableSettings[v.name].visible,
            ),
          },
          variableValues: getVariableValues(get(variableSliderStatesAtom)),
        },
        abortSignal,
      );
    },
  );
});

export const computeSteadyStateAtom = atom(null, async (get, set) => {
  return await runSimulation(
    "steadyState",
    get,
    set,
    async (abortSignal: AbortSignal) => {
      return await get(simulatorAtom).computeSteadyState(
        get(editorContentAtom),
        {
          parameters: null,
          variableValues: getVariableValues(get(variableSliderStatesAtom)),
        },
        abortSignal,
      );
    },
  );
});

export const runParameterScanAtom = atom(null, async (get, set) => {
  const simulator = get(simulatorAtom);
  const parameterScanOptions = get(parameterScanOptionsAtom);
  const variables = get(variablesAtom);
  const variableSettingss = get(variableSettingssAtom);
  const editorContent = get(editorContentAtom);

  return await runSimulation(
    "parameterScan",
    get,
    set,
    async (abortSignal: AbortSignal) => {
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

      const variableValues = getVariableValues(get(variableSliderStatesAtom));

      if (parameterScanOptions.mode === "timeCourse") {
        const scanTimeCourseParameters = {
          ...parameterScanOptions.timeCourseParameters,
          includedVariables: variables.filter(
            (v) =>
              v.name !== simulator.scanIndependentVariableName &&
              variableSettingss[v.name].visible,
          ),
        };

        for (const value of scanValues) {
          resultPromises.push(
            simulator.simulateTimeCourse(
              editorContent,
              {
                parameters: scanTimeCourseParameters,
                variableValues,
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
                parameters: null,
                variableValues,
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
    },
  );
});

export const cancelSimulationAtom = atom(null, (get) => {
  const internalState = get(_simulationInternalStateAtom);
  if (internalState?.abortController) {
    internalState.abortController.abort();
  }
});

export const simulationAtoms = [
  _simulationResultAtom,
  _simulatorAtom,
  _simulationInternalStateAtom,

  simulationResultAtom,
  simulatorAtom,

  simulateTimeCourseAtom,
  computeSteadyStateAtom,
  runParameterScanAtom,
  cancelSimulationAtom,
];
