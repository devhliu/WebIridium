import type { ModelInfo, SimResult } from "@/third-party/copasi";
import type { TimeCourseParameters } from "@/stores/workspace";

export type ParameterScanOptions = {
  varyingParameter: string;
  varyingParameterValue: number;
};

export type SteadyStateResult = {
  value: number;
  eigenValues: number[][];
  concentration: unknown;
  fluxControl: unknown;
  elasticities: unknown;
};

export abstract class Simulator {
  abstract simulateTimeCourse(
    antimonyCode: string,
    {
      parameters,
      parameterScanOptions,
    }: {
      parameters: TimeCourseParameters;
      parameterScanOptions?: ParameterScanOptions;
    },
    abortSignal?: AbortSignal,
  ): Promise<SimResult>;

  abstract computeSteadyState(
    antimonyCode: string,
    {
      timeCourseParameters,
    }: {
      timeCourseParameters: TimeCourseParameters;
    },
    abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult>;

  abstract getModelInfo(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<ModelInfo>;

  abstract getParameterFromSpecies(species: string): string;
}
