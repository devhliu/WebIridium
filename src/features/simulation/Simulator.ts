import type { SimResult } from "@/third-party/copasi";
import type { TimeCourseParameters } from "@/stores/workspace";

export type ParameterScanOptions = {
  varyingParameter: string;
  varyingParameterValue: number;
};

export type SteadyStateResultItem = {
  columns: string[];
  rows: string[];
  values: number[][];
};

export type SteadyStateResult = {
  value: number;
  initialConcentrations: {
    name: string;
    value: number;
  }[];
  eigenValues: number[][];
  jacobian: SteadyStateResultItem;
  concentrationControl: SteadyStateResultItem;
  fluxControl: SteadyStateResultItem;
  elasticities: SteadyStateResultItem;
};

export interface Variable {
  displayName: string;
  /** General name used internally by the simulator */
  name: string;
  /**
   * Internal name of the variable used for scanning. If present, the variable can
   * be used as a parameter in parameter scan. Otherwise it will not appear.
   * This is necessary because, in Copasi,
   * to scan with species named "A", you set the value for "[A]_0"
   */
  scanName?: string;
  category: string;
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
      timeCourseParameters,
    }: {
      timeCourseParameters: TimeCourseParameters;
    },
    abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult>;

  /**
   * NOTE: when switching beteween simulators, make sure to reset the variable list as it is not compatible between variables
   * @returns list of variables the simulator has for the model.
   */
  abstract loadModel(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<Variable[]>;
}
