import type { TimeCourseParameters } from "@/stores/workspace.ts";
import type { ModelInfo, SimResult } from "@/third-party/copasi";
import {
  Simulator,
  type ParameterScanOptions,
  type SteadyStateResult,
  type TimeCourseResult,
  type Variable,
} from "./Simulator";
import { WorkerPool } from "@/features/workerPool.ts";
import { createWorker } from "@/features/workers.ts";

export class CopasiSimulator extends Simulator {
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
        parameters,
        varyingParameter: parameterScanOptions?.varyingParameter,
        varyingParameterValue: parameterScanOptions?.varyingParameterValue,
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
    { timeCourseParameters }: { timeCourseParameters: TimeCourseParameters },
    abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult> {
    const result = (await this.#workerPool.queueTask(
      "steadyState",
      {
        timeCourseParameters: timeCourseParameters,
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
    for (const param of modelInfo.global_parameters) {
      variables.push({
        displayName: param.name,
        name: param.name,
        scanName: param.name,
        category: "Parameter",
      });
    }
    for (const specie of modelInfo.species) {
      variables.push({
        displayName: specie.name,
        name: specie.name,
        scanName: `[${specie.name}]_0`,
        category: "Species",
      });
    }
    return variables;
  }
}
