import { atom } from "jotai";

import { type Palette } from "@/features/colors";

import type {
  ParameterScanResult,
  TimeCourseParameters,
} from "@/features/simulation/Simulator";

/** Time course parameters that are editable by the user manually. */
export type EditableTimeCourseParameters = Omit<
  TimeCourseParameters,
  "includeVariables"
>;

export interface ParameterScanOptions {
  mode: ParameterScanResult["mode"];
  varyingParameter: string | null | undefined;
  min: number;
  max: number;
  numberOfValues: number;
  useLogarithmicDistribution: boolean;
  timeCourseParameters: EditableTimeCourseParameters;
}

export interface GraphSettings {
  backgroundColor: string;
  drawingAreaColor: string;

  includeTitle: boolean;
  title: string;

  includeBorder: boolean;
  borderColor: string;
  borderThickness: number;

  isAutoscaledX: boolean;
  minX: number;
  maxX: number;

  isAutoscaledY: boolean;
  minY: number;
  maxY: number;

  margin: number;
}

export interface VariableSettings {
  displayName: string;
  visible: boolean;
  color: string;
  width: number;
}

export const nameAtom = atom("Starter Model");
export const paletteAtom = atom<Palette>("Custom");
export const variableSettingssAtom = atom<Record<string, VariableSettings>>({});
export const independentVariableAtom = atom<string | null>(null);

export const timeCourseParametersAtom = atom<EditableTimeCourseParameters>({
  startTime: 0,
  endTime: 20,
  numberOfPoints: 200,
});

export const parameterScanOptionsAtom = atom<ParameterScanOptions>({
  mode: "timeCourse",
  varyingParameter: null,
  min: 0.1,
  max: 1,
  numberOfValues: 16,
  useLogarithmicDistribution: false,
  timeCourseParameters: {
    startTime: 0,
    endTime: 10,
    numberOfPoints: 100,
  },
});

export const graphSettingsAtom = atom<GraphSettings>({
  backgroundColor: "#ffffff",
  drawingAreaColor: "#e1d5ed",

  includeTitle: true,
  title: "Transition of substances in chemical reaction",

  includeBorder: true,
  borderColor: "#000000",
  borderThickness: 0.5,

  isAutoscaledX: true,
  minX: 0,
  maxX: 10,

  isAutoscaledY: true,
  minY: 0,
  maxY: 10,

  margin: 70,
});

export const settingsAtoms = [
  nameAtom,
  paletteAtom,

  variableSettingssAtom,
  independentVariableAtom,

  timeCourseParametersAtom,
  parameterScanOptionsAtom,

  graphSettingsAtom,
];
