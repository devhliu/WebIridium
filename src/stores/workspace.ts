/**
 * manages state of the current workspace. stuff like:
 *  - editor content
 *  - simulation stuff
 */

import { atom } from "jotai";
import type {
  SimulationResult,
  TimeCourseParameters,
  Variable,
} from "@/features/simulation/Simulator";
import { type Palette } from "@/features/colors";
import { EditorContent } from "@/features/editorContent";

export interface ParameterScanOptions {
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

// Atoms

export const editorContentAtom = atom<EditorContent | null>(
  () => new EditorContent(),
);

export const isSimulatingAtom = atom(false);
export const simulationResultAtom = atom<SimulationResult | null>(null);

export const independentVariableAtom = atom<string | null>(null);
export const variablesAtom = atom<Variable[]>([]);

export const paletteAtom = atom<Palette>("Custom");

export const timeCourseParametersAtom = atom<
  Omit<TimeCourseParameters, "includeVariables">
>({
  startTime: 0,
  endTime: 20,
  numberOfPoints: 200,
});

export const parameterScanOptionsAtom = atom<ParameterScanOptions>({
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
  editorContentAtom,
  isSimulatingAtom,
  simulationResultAtom,

  independentVariableAtom,
  variablesAtom,

  paletteAtom,

  timeCourseParametersAtom,
  parameterScanOptionsAtom,
  graphSettingsAtom,
];
