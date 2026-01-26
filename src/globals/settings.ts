// This is distinct from the global settings because it only contains settings
// specific to the current model. So it won't contain things like the UI theme,
// but it will contain things like the plot background color.

import { atom } from "jotai";

import { type Palette } from "@/features/colors";
import { type LineStyle } from "@/features/lineStyle";

import type {
  ParameterScanResult,
  TimeCourseParameters,
} from "@/features/simulation/Simulator";
import {
  defaultGraphSettings,
  graphPresets,
  type GraphSettings,
} from "@/features/graphPresets";

/** Time course parameters that are editable by the user manually. */
export type EditableTimeCourseParameters = Omit<
  TimeCourseParameters,
  "includedVariables" | "resetInitialConditions"
>;

export interface ParameterScanOptions {
  mode: ParameterScanResult["mode"];
  varyingParameter: string | null | undefined;
  timeCourseParameters: EditableTimeCourseParameters;

  // range properties
  min: number;
  max: number;
  numberOfValues: number;
  useLogarithmicDistribution: boolean;

  // list properties
  useNumberList: boolean;
  numberList: string;
}
export interface VariableSettings {
  displayName: string;
  visible: boolean;
  color: string;
  width: number;
  lineStyle: LineStyle;
}

export const paletteAtom = atom<Palette>("Custom");
export const independentVariableAtom = atom<string | null>(null);

export const defaultTimeCourseParameters: EditableTimeCourseParameters = {
  startTime: 0,
  endTime: 20,
  numberOfPoints: 200,
};
export const timeCourseParametersAtom = atom(defaultTimeCourseParameters);

export const defaultParameterScanOptions: ParameterScanOptions = {
  mode: "timeCourse",
  varyingParameter: null,
  timeCourseParameters: {
    startTime: 0,
    endTime: 10,
    numberOfPoints: 100,
  },

  min: 0.1,
  max: 1,
  numberOfValues: 16,
  useLogarithmicDistribution: false,

  useNumberList: false,
  numberList: "1 2 3 4 5",
};
export const parameterScanOptionsAtom = atom(defaultParameterScanOptions);

// GRAPH SETTINGS STUFF

export const CUSTOM_PRESET = "Custom";
export const currentGraphPresetAtom = atom(CUSTOM_PRESET);

export const customGraphSettingsAtom = atom(defaultGraphSettings);

export const graphPresetsAtom = atom(
  graphPresets as Record<string, GraphSettings | undefined>,
);

export const graphSettingsAtom = atom(
  (get) =>
    get(graphPresetsAtom)[get(currentGraphPresetAtom)] ??
    get(customGraphSettingsAtom),
);
export const updateGraphSettingsAtom = atom(
  null,
  (get, set, newSettings: GraphSettings) => {
    const preset = get(currentGraphPresetAtom);
    const presets = get(graphPresetsAtom);
    if (preset === CUSTOM_PRESET) {
      set(customGraphSettingsAtom, newSettings);
    } else {
      set(graphPresetsAtom, {
        ...presets,
        [preset]: newSettings,
      });
    }
  },
);
