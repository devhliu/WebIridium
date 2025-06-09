import type { ModelInfo, SimResult } from "@/third-party/copasi";
import type { TimeCourseParameters } from "@/stores/workspace";

export type SteadyStateParameters = {
  
}

export type ParameterScanOptions = {
  varyingParameter: string;
  varyingParameterValue: number;
};

export type SteadyStateResults = {
  value: number,
  eigenValues: number[][],
  concentration: object,
  fluxControl: object,
  elasticities: object,
}

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
      parameters,
    }: {
      parameters: SteadyStateParameters,
    },
    abortSignal?: AbortSignal,
  ): Promise<SteadyStateResults>;

  abstract getModelInfo(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<ModelInfo>;

  abstract getParameterFromSpecies(species: string): string;
}
