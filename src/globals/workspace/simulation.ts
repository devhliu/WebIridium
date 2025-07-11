import { atom, type Getter } from "jotai";

import type {
  ParameterScanResult,
  SettableVariable,
  SimulationResult,
  Simulator,
  Variable,
} from "@/features/simulation/Simulator";
import {
  getLinearDistribution,
  getLogarithmicDistribution,
} from "@/features/distribution";

import type { Setter } from "jotai";
import {
  editorContentAtom,
  modelStatusAtom,
  variablesAtom,
  variablesMapAtom,
} from "./model";
import {
  independentVariableAtom,
  parameterScanOptionsAtom,
  timeCourseParametersAtom,
  variableSettingssAtom,
} from "./settings";
import { variableSliderStatesAtom, type VariableSliderState } from "./slider";
import { WorkerTermination } from "@/features/workerPool";

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
  variableMap: Map<string, Variable>,
) => {
  return Object.entries(sliderStates).reduce(
    (acc, [name, state]) => ({
      ...acc,
      [(variableMap.get(name) as SettableVariable).setName]: state.value,
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
                v.name === independentVariable ||
                variableSettings[v.name].visible,
            ),
          },
          variableValues: getVariableValues(
            get(variableSliderStatesAtom),
            get(variablesMapAtom),
          ),
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
          variableValues: getVariableValues(
            get(variableSliderStatesAtom),
            get(variablesMapAtom),
          ),
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
  const variablesMap = get(variablesMapAtom);

  return await runSimulation(
    "parameterScan",
    get,
    set,
    async (abortSignal: AbortSignal) => {
      const parameter = parameterScanOptions.varyingParameter;
      if (!parameter) {
        throw new Error("select parameter to scan with");
      }

      let scanValues: number[];
      const resultPromises = [];

      if (parameterScanOptions.useNumberList) {
        // TODO: unit test this path
        const numbers = parameterScanOptions.numberList
          .split(" ")
          .filter((n) => n.trim().length > 0)
          .map((n) => +n.trim());
        if (numbers.length === 0 || numbers.some((n) => isNaN(n))) {
          throw new Error(
            "Number list should be a list of numbers separate by spaces.",
          );
        }

        scanValues = numbers;
      } else {
        const getDistribution = parameterScanOptions.useLogarithmicDistribution
          ? getLogarithmicDistribution
          : getLinearDistribution;
        scanValues = getDistribution(
          parameterScanOptions.min,
          parameterScanOptions.max,
          parameterScanOptions.numberOfValues,
        );
      }

      const parameterSetName = (variablesMap.get(parameter) as SettableVariable)
        .setName;
      const variableValues = getVariableValues(
        get(variableSliderStatesAtom),
        get(variablesMapAtom),
      );

      if (parameterScanOptions.mode === "timeCourse") {
        const scanTimeCourseParameters = {
          ...parameterScanOptions.timeCourseParameters,
          includedVariables: variables.filter(
            (v) =>
              v.name === simulator.scanIndependentVariableName ||
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
                  varyingParameter: parameterSetName,
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
                  varyingParameter: parameterSetName,
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
