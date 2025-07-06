/**
 * manages state of the current workspace. stuff like:
 *  - editor content
 *  - simulation stuff
 */

import { atom } from "jotai";

import defaultModel from "@/assets/models/default.ant?raw";

import type {
  ParameterScanResult,
  SimulationResult,
  Variable,
} from "@/features/simulation/Simulator";
import { type Palette } from "@/features/colors";
import type { EditableTimeCourseParameters } from "@/features/simulation/useSimulate";

export interface ParameterScanOptions {
  mode: ParameterScanResult["mode"];
  varyingParameter: string | null | undefined;
  min: number;
  max: number;
  numberOfValues: number;
  useLogarithmicDistribution: boolean;
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

export interface VariableSliderState {
  value: number;
  min: number;
  max: number;
}

export type ModelStatus =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success" };

// Atoms

export const editorContentAtom = atom(defaultModel);
export const modelStatusAtom = atom<ModelStatus>({ type: "loading" });
export const nameAtom = atom("Starter Model");

export const isSimulatingAtom = atom(false);
export const simulationResultAtom = atom<SimulationResult | null>(null);

export const independentVariableAtom = atom<string | null>(null);
export const variablesAtom = atom<Variable[]>([]);
export const variableSettingssAtom = atom<Record<string, VariableSettings>>({});
export const variableSliderStatesAtom = atom<
  Record<string, VariableSliderState | undefined>
>({});

export const paletteAtom = atom<Palette>("Custom");

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

/**
 * List of all atoms for the workspace, meant to be used with <ScopeProvider> from "jotai-scope"
 * so you can you scope the workspace.
 */
export const allWorkspaceAtoms = [
  nameAtom,

  editorContentAtom,
  modelStatusAtom,
  isSimulatingAtom,
  simulationResultAtom,

  independentVariableAtom,
  variablesAtom,
  variableSettingssAtom,
  variableSliderStatesAtom,

  paletteAtom,

  timeCourseParametersAtom,
  parameterScanOptionsAtom,
  graphSettingsAtom,
];
