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

const SLIDER_CHANGE_DEBOUNCE_TIME = 25;

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

const _setSlidersAndSimulateAtom = atom(
  null,
  (
    get,
    set,
    {
      sliderStates,
      skipDebounce = false,
    }: {
      sliderStates: Record<string, VariableSliderState>;
      skipDebounce?: boolean;
    },
  ) => {
    set(variableSliderStatesAtom, sliderStates);

    let timeoutId: number | null = null;
    const simulate = async () => {
      if (get(_queuedSliderSimulationIdAtom) === timeoutId) {
        set(_queuedSliderSimulationIdAtom, null);
      }

      switch (get(simulationResultAtom)?.type) {
        case "steadyState":
          await set(computeSteadyStateAtom, { delayEnd: true });
          break;
        case "parameterScan":
          await set(runParameterScanAtom, { delayEnd: true });
          break;
        case "timeCourse":
        default:
          await set(simulateTimeCourseAtom, { delayEnd: true });
          break;
      }
    };

    if (skipDebounce) {
      void simulate();
    } else if (!get(_queuedSliderSimulationIdAtom)) {
      timeoutId = setTimeout(
        simulate,
        SLIDER_CHANGE_DEBOUNCE_TIME,
      ) as unknown as number;

      set(_queuedSliderSimulationIdAtom, timeoutId);
    }
  },
);

export const updateSliderAndSimulateAtom = atom(
  null,
  (get, set, { id, value }: { id: string; value: number }) => {
    const sliderStates = get(variableSliderStatesAtom);
    set(_setSlidersAndSimulateAtom, {
      sliderStates: {
        ...sliderStates,
        [id]: {
          ...sliderStates[id],
          value,
        },
      },
      skipDebounce: false,
    });
  },
);

export const loadPresetAndSimulateAtom = atom(
  null,
  (get, set, preset: Record<string, number>) => {
    const variablesMap = get(variablesMapAtom);
    const newSliderStates: Record<string, VariableSliderState> = {};

    // patch in new values
    for (const [id, value] of Object.entries(preset)) {
      const variable = variablesMap.get(id);
      if (variable) {
        const state = getInitialSliderState(variable as SettableVariable);
        state.value = value;
        newSliderStates[id] = state;
      }
    }

    set(_setSlidersAndSimulateAtom, {
      sliderStates: newSliderStates,
      skipDebounce: true,
    });
  },
);
