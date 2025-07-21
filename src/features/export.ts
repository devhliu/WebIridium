/**
 * Functions for exporting simulation results.
 */

import plotly from "plotly.js";

import type { SimulationResult } from "./simulation/Simulator";

export type ExportFunction = (
  simulationResult: SimulationResult,
) => Promise<Blob>;

export const exportAsPng: ExportFunction = (simulationResult) => {};

export const exportAsCsv: ExportFunction = (simulationResult) => {};
