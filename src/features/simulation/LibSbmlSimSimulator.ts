import {
  Simulator,
  type TimeCourseParameters,
  type SteadyStateParameters,
  type TimeCourseResult,
  type SteadyStateResult,
  type ParameterScanOptions,
  type VariableValues,
  type Variable,
} from "./Simulator";
import { WorkerPool } from "@/features/workerPool";
import { createWorker } from "@/features/workers";

interface LibSbmlSimTimeCourseResult {
  columns: {
    title: string;
    values: number[];
  }[];
}

export class LibSbmlSimSimulator extends Simulator {
  defaultIndependentVariableId = "Time";
  scanIndependentVariableId = "Time";

  #workerPool: WorkerPool;

  constructor() {
    super();
    this.#workerPool = new WorkerPool(() => createWorker("libsbmlsim"), {
      maxWorkers: 4,
    });
  }

  async simulateTimeCourse(
    antimonyCode: string,
    {
      parameters,
      variableValues,
      parameterScanOptions,
    }: {
      parameters: TimeCourseParameters;
      variableValues: VariableValues;
      parameterScanOptions?: ParameterScanOptions;
    },
    abortSignal?: AbortSignal,
  ): Promise<TimeCourseResult> {
    const result = (await this.#workerPool.queueTask(
      "timeCourse",
      {
        parameters,
        variableValues,
        parameterScanOptions,
      },
      antimonyCode,
      abortSignal,
    )) as LibSbmlSimTimeCourseResult;

    return {
      type: "timeCourse",
      columns: result.columns,
      columnSet: new Set(result.columns.map((col) => col.title)),
    };
  }

  computeSteadyState(
    _antimonyCode: string,
    _params: {
      parameters: SteadyStateParameters;
      variableValues: VariableValues;
      parameterScanOptions?: ParameterScanOptions;
    },
    _abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult> {
    return Promise.resolve({
      type: "steadyState",
      value: 0,
      concentrations: [],
      eigenValues: [],
      jacobian: {
        columns: [],
        rows: [],
        values: [],
      },
      concentrationControl: {
        columns: [],
        rows: [],
        values: [],
      },
      fluxControl: {
        columns: [],
        rows: [],
        values: [],
      },
      elasticities: {
        columns: [],
        rows: [],
        values: [],
      },
    });
  }

  async loadModel(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<Variable[]> {
    const result = (await this.#workerPool.queueTask(
      "loadModel",
      antimonyCode,
      abortSignal,
    )) as {
      species: string[];
      parameters: string[];
    };

    const variables: Variable[] = [];

    variables.push({
      type: "normal",
      defaultDisplayName: "Time",
      name: "Time",
      category: "Time",
    });

    for (const specie of result.species) {
      variables.push({
        type: "settable",
        defaultDisplayName: specie,
        name: specie,
        category: "Species",

        setName: specie,
        defaultValue: 5,
      });
    }

    for (const parameter of result.parameters) {
      variables.push({
        type: "settable",
        defaultDisplayName: parameter,
        name: parameter,
        category: "Parameters",

        setName: parameter,
        defaultValue: 5,
      });
    }

    return variables;
  }
}
