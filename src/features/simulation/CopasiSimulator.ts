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
import { generateDefaultCustomPalette } from "../colors";

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

    const colorGenerator = generateDefaultCustomPalette();
    const variables: Variable[] = [];

    variables.push({
      displayName: "Time",
      name: "Time",
      category: "Time",

      visible: false,
      color: colorGenerator.next().value!,
      width: 2,
    });

    for (const specie of modelInfo.species) {
      variables.push({
        displayName: specie.name,
        name: specie.name,
        scanName: `[${specie.name}]_0`,
        category: "Species",

        visible: true,
        color: colorGenerator.next().value!,
        width: 2,
      });
    }

    // this is done in a separate loop so the displayed species get all the good default colors
    for (const specie of modelInfo.species) {
      // TODO!IMPORTANT: only do this for floating species, not boundary species?
      //                 how to determine if a species is a boundary species?
      variables.push({
        displayName: `${specie.name}'`,
        name: `${specie.name}.Rate`,
        category: "Rate of Changes",

        visible: false,
        color: colorGenerator.next().value!,
        width: 2,
      });
    }

    for (const param of modelInfo.global_parameters) {
      variables.push({
        displayName: param.name,
        name: param.name,
        scanName: param.name,
        category: "Parameter",

        visible: false,
        color: colorGenerator.next().value!,
        width: 2,
      });
    }

    return variables;
  }
}
