export interface TimeCourseParameters {
  startTime: number;
  endTime: number;
  numberOfPoints: number;

  /** List of variables you want to include in the results. */
  includeVariables: Variable[];
}

export type ParameterScanOptions = {
  varyingParameter: string;
  varyingParameterValue: number;
};

export type Variable = {
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

  // User settings
  visible: boolean;
};

/* RESULT STUFF */

export type TimeCourseResult = {
  type: "timeCourse";
  recordedSteps: number;
  // title -> values
  columns: {
    title: string;
    values: number[];
  }[];
  // Set of column titles. For performance reasons.
  columnSet: Set<string>;
};

export type SteadyStateResultItem = {
  columns: string[];
  rows: string[];
  values: number[][];
};

export type SteadyStateResult = {
  type: "steadyState";
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

export type ParameterScanResult =
  | {
      type: "parameterScan";
      method: "timeCourse";
      parameter: string;
      // parameter value -> result
      scans: (TimeCourseResult & {
        parameterValue: number;
      })[];
    }
  | {
      type: "parameterScan";
      method: "steadyState";
      parameter: string;
      // parameter value -> result
      scans: (SteadyStateResult & {
        parameterValue: number;
      })[];
    };

export type SimulationResult =
  | TimeCourseResult
  | SteadyStateResult
  | ParameterScanResult;

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
  ): Promise<TimeCourseResult>;

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
   * @returns List of variables the simulator has for the model. These are the default
   *          values for the variables, but the user may modify theme.
   */
  abstract loadModel(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<Variable[]>;
}
