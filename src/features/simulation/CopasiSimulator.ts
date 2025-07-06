import type { ModelInfo, SimResult } from "@/third-party/copasi";
import {
  Simulator,
  type TimeCourseParameters,
  type ParameterScanOptions,
  type SteadyStateResult,
  type TimeCourseResult,
  type Variable,
  type SteadyStateParameters,
} from "./Simulator";
import { WorkerPool } from "@/features/workerPool.ts";
import { createWorker } from "@/features/workers.ts";

export class CopasiSimulator extends Simulator {
  defaultIndependentVariableName = "Time";
  scanIndependentVariableName = "Time";

  #workerPool: WorkerPool;

  constructor() {
    super();
    this.#workerPool = new WorkerPool(() => createWorker("copasi"), {
      maxWorkers: 3,
    });
  }

  async simulateTimeCourse(
    antimonyCode: string,
    {
      parameters,
      parameterScanOptions,
    }: {
      parameters: TimeCourseParameters;
      parameterScanOptions?: ParameterScanOptions;
    },
    abortSignal?: AbortSignal,
  ): Promise<TimeCourseResult> {
    const result = (await this.#workerPool.queueTask(
      "timeCourse",
      {
        parameters: {
          ...parameters,
          selectionList: parameters.includeVariables.map((v) => v.name),
        },
        ...parameterScanOptions,
      },
      antimonyCode,
      abortSignal,
    )) as SimResult;

    return {
      type: "timeCourse",
      recordedSteps: result.recorded_steps,
      columns: result.titles.map((title, index) => ({
        title,
        values: result.columns[index],
      })),
      columnSet: new Set(result.titles),
    };
  }

  async computeSteadyState(
    antimonyCode: string,
    {
      parameters,
      parameterScanOptions,
    }: {
      parameters: SteadyStateParameters;
      parameterScanOptions?: ParameterScanOptions;
    },
    abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult> {
    const result = (await this.#workerPool.queueTask(
      "steadyState",
      {
        parameters,
        ...parameterScanOptions,
      },
      antimonyCode,
      abortSignal,
    )) as object;

    return { type: "steadyState", ...result } as SteadyStateResult;
  }

  async loadModel(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<Variable[]> {
    const modelInfo = (await this.#workerPool.queueTask(
      "loadModel",
      null,
      antimonyCode,
      abortSignal,
    )) as ModelInfo;

    const variables: Variable[] = [];

    variables.push({
      type: "normal",
      defaultDisplayName: "Time",
      name: "Time",
      category: "Time",
    });

    for (const specie of modelInfo.species) {
      // TODO!IMPORTANT: only do this for floating species, not boundary species?
      //                 how to determine if a species is a boundary species?
      variables.push({
        type: "normal",
        defaultDisplayName: `${specie.name}'`,
        name: `${specie.name}.Rate`,
        category: "Rate of Changes",
      });

      variables.push({
        type: "settable",
        defaultDisplayName: specie.name,
        name: specie.name,
        category: "Species",

        setName: `[${specie.name}]_0`,
        defaultValue: specie.initial_concentration,
      });
    }

    for (const param of modelInfo.global_parameters) {
      variables.push({
        type: "settable",
        defaultDisplayName: param.name,
        name: param.name,
        category: "Parameters",

        setName: param.name,
        defaultValue: param.initial_value,
      });
    }

    return variables;
  }
}
