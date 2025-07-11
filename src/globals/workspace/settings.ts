import { atom } from "jotai";

import { type Palette } from "@/features/colors";
import { type LineStyle } from "@/features/lineStyle";

import type {
  ParameterScanResult,
  TimeCourseParameters,
} from "@/features/simulation/Simulator";

/** Time course parameters that are editable by the user manually. */
export type EditableTimeCourseParameters = Omit<
  TimeCourseParameters,
  "includedVariables"
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

export interface AxisSettings {
  includeTitle: boolean;
  useDefaultTitle: boolean;
  title: string;
  showMajorTicks: boolean;
  color: string;
}

export interface GridSettings {
  enabled: {
    x: boolean;
    y: boolean;
  };
  xColor: string;
  yColor: string;
  xWidth: number;
  yWidth: number;
  numXGrids: number;
  numYGrids: number;
}

export interface LegendSettings {
  visible: boolean;
  backgroundColor: string;
  padding: number;
  lineLength: number;
  borderColor: string;
  borderThickness: number;
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

  xAxis: AxisSettings;
  yAxis: AxisSettings;

  majorGrid: GridSettings;
  minorGrid: GridSettings;

  legend: LegendSettings;
}

export interface VariableSettings {
  displayName: string;
  visible: boolean;
  color: string;
  width: number;
  lineStyle: LineStyle;
}

export const nameAtom = atom("Starter Model");
export const paletteAtom = atom<Palette>("Custom");
export const independentVariableAtom = atom<string | null>(null);

// note that variable settings will always be a superset of
// variables because the settings are retained even if the
// variables are no longer in the model.
export const variableSettingssAtom = atom<Record<string, VariableSettings>>({});

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

  xAxis: {
    includeTitle: true,
    useDefaultTitle: true,
    title: "Time",
    showMajorTicks: true,
    color: "#000",
  },

  yAxis: {
    includeTitle: true,
    useDefaultTitle: true,
    title: "Concentrations",
    showMajorTicks: true,
    color: "#000",
  },

  majorGrid: {
    enabled: { x: false, y: false },
    xColor: "#888",
    yColor: "#888",
    xWidth: 0.5,
    yWidth: 0.5,
    numXGrids: 4,
    numYGrids: 4,
  },

  minorGrid: {
    enabled: { x: false, y: false },
    xColor: "#888",
    yColor: "#888",
    xWidth: 0.5,
    yWidth: 0.5,
    numXGrids: 4,
    numYGrids: 4,
  },

  legend: {
    visible: true,
    backgroundColor: "#fff",
    padding: 15,
    lineLength: 50,
    borderColor: "#000",
    borderThickness: 1,
  },
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
