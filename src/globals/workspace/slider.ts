import { atom } from "jotai";
import {
  computeSteadyStateAtom,
  runParameterScanAtom,
  simulateTimeCourseAtom,
  simulationResultAtom,
} from "./simulation";
import { type SettableVariable } from "@/features/simulation/Simulator";
import { variablesMapAtom } from "./model";

export interface VariableSliderState {
  value: number;
  min: number;
  max: number;
}

const _queuedSliderSimulationIdAtom = atom<number | null>(null);

export const variableSliderStatesAtom = atom<
  Record<string, VariableSliderState>
>({});

export const isSliderSimulationQueuedAtom = atom(
  (get) => get(_queuedSliderSimulationIdAtom) !== null,
);

export type UpdateVariableSliderValueOptions = {
  variableName: string;
  value: number;
};

const SLIDER_CHANGE_DEBOUNCE_TIME = 10;

export const getInitialSliderState = (
  variable: SettableVariable,
): VariableSliderState => {
  const baseScale = variable.defaultValue || 1;
  let result;
  if (variable.defaultValue >= 0) {
    result = {
      value: variable.defaultValue,
      min: Math.round(100 * (0.1 * baseScale)) / 100,
      max: Math.round(100 * (5 * baseScale)) / 100,
    };
  } else {
    result = {
      value: variable.defaultValue,
      min: Math.round(100 * (5 * baseScale)) / 100,
      max: Math.round(100 * (0.1 * baseScale)) / 100,
    };
  }

  // sometimes the baseScale is so small, min and max get rounded to zero
  if (result.min === result.max) {
    result.max += 1;
  }

  return result;
};

export const updateAndSimulateVariableSlidersAtom = atom(
  null,
  (
    get,
    set,
    {
      patchIn: patchSliderStates,
      skipDebounce = false,
    }: { patchIn: Record<string, number>; skipDebounce?: boolean },
  ) => {
    const variablesMap = get(variablesMapAtom);
    const newSliderStates = { ...get(variableSliderStatesAtom) };

    // patch in new values
    for (const [name, value] of Object.entries(patchSliderStates)) {
      if (newSliderStates[name]) {
        newSliderStates[name] = { ...newSliderStates[name], value };
      } else {
        const variable = variablesMap.get(name);
        if (variable) {
          const state = getInitialSliderState(variable as SettableVariable);
          state.value = value;
          newSliderStates[name] = state;
        }
      }
    }

    set(variableSliderStatesAtom, newSliderStates);

    // queue up a simulation
    const oldTimeoutId = get(_queuedSliderSimulationIdAtom);
    if (oldTimeoutId) {
      clearTimeout(oldTimeoutId);
    }

    let timeoutId: number | null = null;
    const simulate = async () => {
      if (get(_queuedSliderSimulationIdAtom) === timeoutId) {
        set(_queuedSliderSimulationIdAtom, null);
      }

      switch (get(simulationResultAtom)?.type) {
        case "steadyState":
          await set(computeSteadyStateAtom);
          break;
        case "parameterScan":
          await set(runParameterScanAtom);
          break;
        case "timeCourse":
        default:
          await set(simulateTimeCourseAtom);
          break;
      }
    };

    if (skipDebounce) {
      void simulate();
    } else {
      timeoutId = setTimeout(
        simulate,
        SLIDER_CHANGE_DEBOUNCE_TIME,
      ) as unknown as number;

      set(_queuedSliderSimulationIdAtom, timeoutId);
    }
  },
);

export const sliderAtoms = [
  _queuedSliderSimulationIdAtom,
  isSliderSimulationQueuedAtom,
  variableSliderStatesAtom,
];
