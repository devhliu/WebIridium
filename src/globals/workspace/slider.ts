import { atom } from "jotai";
import {
  computeSteadyStateAtom,
  runParameterScanAtom,
  simulateTimeCourseAtom,
  simulationResultAtom,
} from "./simulation";

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

export const updateVariableSliderValueAtom = atom(
  null,
  (get, set, { variableName, value }: UpdateVariableSliderValueOptions) => {
    const variableSliderStates = get(variableSliderStatesAtom);
    set(variableSliderStatesAtom, {
      ...variableSliderStates,
      [variableName]: {
        ...variableSliderStates[variableName],
        value,
      },
    });

    // queue up a simulation
    const oldTimeoutId = get(_queuedSliderSimulationIdAtom);
    if (oldTimeoutId) {
      clearTimeout(oldTimeoutId);
    }

    const timeoutId = setTimeout(async () => {
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
    }, SLIDER_CHANGE_DEBOUNCE_TIME) as unknown as number;

    set(_queuedSliderSimulationIdAtom, timeoutId);
  },
);

export const sliderAtoms = [
  _queuedSliderSimulationIdAtom,
  isSliderSimulationQueuedAtom,
  variableSliderStatesAtom,
];
