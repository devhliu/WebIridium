export type TimeCourseParameters = {
  startTime: number;
  endTime: number;
  numberOfPoints: number;

  /** List of variables you want to include in the results. */
  includeVariables: Variable[];
};

export type SteadyStateParameters = {};

export type ParameterScanOptions = {
  varyingParameter: string;
  varyingParameterValue: number;
};

export type Variable = {
  /** Default display name. */
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
  concentrations: {
    name: string;
    value: number;
  }[];
  eigenValues: number[][];
  jacobian: SteadyStateResultItem;
  concentrationControl: SteadyStateResultItem;
  fluxControl: SteadyStateResultItem;
  elasticities: SteadyStateResultItem;
};

export type ParameterScanExtras = {
  /** The value of the parameter that was used for the scan. */
  parameterValue: number;
  /**
   * Number from [0-1] representing what percentage the all the scans was completed when this scan was ran.
   * So, for the scan range [0, 100], if the parameterValue is 50 and its linear,
   * the scanPercent will be 0.5.
   */
  scanPercent: number;
};

export type ParameterScanResult =
  | {
      type: "parameterScan";
      mode: "timeCourse";
      parameter: string;
      // parameter value -> result
      scans: (TimeCourseResult & ParameterScanExtras)[];
    }
  | {
      type: "parameterScan";
      mode: "steadyState";
      parameter: string;
      // parameter value -> result
      scans: (ParameterScanExtras & {
        concentrations: {
          name: string;
          value: number;
        }[];
      })[];
    };

export type SimulationResult =
  | TimeCourseResult
  | SteadyStateResult
  | ParameterScanResult;

export abstract class Simulator {
  abstract defaultIndependentVariableName: string;
  abstract scanIndependentVariableName: string;

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
      parameters,
      parameterScanOptions,
    }: {
      parameters: SteadyStateParameters;
      parameterScanOptions?: ParameterScanOptions;
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
