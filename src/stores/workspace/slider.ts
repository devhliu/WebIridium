import { atom } from "jotai";

export interface VariableSliderState {
  value: number;
  min: number;
  max: number;
}

export const variableSliderStatesAtom = atom<
  Record<string, VariableSliderState | undefined>
>({});

export const sliderAtoms = [variableSliderStatesAtom];
