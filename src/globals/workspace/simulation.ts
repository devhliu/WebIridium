import { atom, type Getter } from "jotai";

import type {
  ParameterScanResult,
  SettableVariable,
  SimulationResult,
  Simulator,
  TimeCourseParameters,
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
import { currentRightPanelAtom } from "./layout";
import { WorkerTermination } from "@/features/workerPool";
import { tryAddToHistoryAtom } from "./history";

export type SimulationOperationResult =
  | { type: "success" }
  | { type: "cancel" }
  | { type: "failure"; message: string };

// internal atoms

type SimulationInternalState = {
  type: string;
  abortController: AbortController;
};

// pretend there is a Simulator since it will always be instantiated
// when the App is created
const _simulatorAtom = atom<Simulator>({} as Simulator);

const _simulationInternalStateAtom = atom<SimulationInternalState | null>(null);

// exported atoms

export const simulationResultAtom = atom<SimulationResult | null>(null);
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
): Record<string, number> => {
  const values: Record<string, number> = {};
  for (const [name, state] of Object.entries(sliderStates)) {
    const variable = variableMap.get(name) as SettableVariable;
    if (state.value === variable.defaultValue) {
      // ignore it if the value is the same
      continue;
    }
    values[variable.setName] = state.value;
  }
  return values;
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
    const abortController = new AbortController();
    set(_simulationInternalStateAtom, {
      type: simulationType,
      abortController,
    });

    try {
      const code = get(editorContentAtom);

      const result = await run(abortController.signal);
      set(simulationResultAtom, result);
      set(currentRightPanelAtom, "Results");
      set(tryAddToHistoryAtom, { code, result });

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

export interface SimulateTimeCourseOptions {
  /* default: true */
  resetInitialConditions?: boolean;
}

export const simulateTimeCourseAtom = atom(
  null,
  async (
    get,
    set,
    { resetInitialConditions = true }: SimulateTimeCourseOptions = {},
  ) => {
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
              resetInitialConditions,
              includedVariables: variables.filter(
                (v) =>
                  v.id === independentVariable ||
                  variableSettings[v.id].visible,
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
  },
);

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
        const scanTimeCourseParameters: TimeCourseParameters = {
          ...parameterScanOptions.timeCourseParameters,
          resetInitialConditions: true,
          includedVariables: variables.filter(
            (v) =>
              v.id === simulator.scanIndependentVariableId ||
              variableSettingss[v.id].visible,
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
            // special case if there is only one value, have scan percent be 0% instead of 100% since it looks better for Custom palette
            scanPercent:
              scanValues.length === 1 ? 0 : i / (scanValues.length - 1),
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
  _simulatorAtom,
  _simulationInternalStateAtom,

  simulationResultAtom,
  simulatorAtom,

  simulateTimeCourseAtom,
  computeSteadyStateAtom,
  runParameterScanAtom,
  cancelSimulationAtom,
];
