import { atom } from "jotai";
import {
  computeSteadyStateAtom,
  runParameterScanAtom,
  simulateTimeCourseAtom,
  simulationResultAtom,
} from "./simulation";
import type { Variable } from "@/features/simulation/Simulator";
import { variablesAtom } from "./model";

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

const getModelDebounceTime = (variables: Variable[]): number => {
  const speciesCount = variables.filter(
    (v) => v.category === "Floating Species",
  ).length;
  if (speciesCount > 16) {
    return 250;
  } else if (speciesCount > 10) {
    return 100;
  } else if (speciesCount > 7) {
    return 25;
  } else {
    return 10;
  }
};

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
    if (!get(_queuedSliderSimulationIdAtom)) {
      const timeoutId = setTimeout(
        async () => {
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
        },
        getModelDebounceTime(get(variablesAtom)),
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
