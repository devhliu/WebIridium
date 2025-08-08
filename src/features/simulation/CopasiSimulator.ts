import type { ModelInfo, SimResult } from "@/third-party/copasi";
import {
  Simulator,
  type TimeCourseParameters,
  type ParameterScanOptions,
  type SteadyStateResult,
  type TimeCourseResult,
  type Variable,
  type SteadyStateParameters,
  type VariableValues,
} from "./Simulator";
import { WorkerPool } from "@/features/workerPool.ts";
import { createWorker } from "@/features/workers.ts";

export class CopasiSimulator extends Simulator {
  defaultIndependentVariableId = "Time";
  scanIndependentVariableId = "Time";

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
        parameters: {
          ...parameters,
          selectionList: parameters.includedVariables.map((v) => v.name),
        },
        variableValues,
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
      variableValues,
      parameterScanOptions,
    }: {
      parameters: SteadyStateParameters;
      variableValues: VariableValues;
      parameterScanOptions?: ParameterScanOptions;
    },
    abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult> {
    const result = (await this.#workerPool.queueTask(
      "steadyState",
      {
        parameters,
        variableValues,
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
    const { modelInfo, boundarySpeciesNames, reactionIds } =
      (await this.#workerPool.queueTask(
        "loadModel",
        null,
        antimonyCode,
        abortSignal,
      )) as {
        modelInfo: ModelInfo;
        boundarySpeciesNames: string[];
        reactionIds: string[];
      };
    const boundarySpeciesSet = new Set(boundarySpeciesNames);

    const variables: Variable[] = [];

    variables.push({
      type: "normal",
      defaultDisplayName: "Time",
      name: "Time",
      category: "Time",
    });

    for (const specie of modelInfo.species) {
      if (boundarySpeciesSet.has(specie.name)) {
        variables.push({
          type: "settable",
          defaultDisplayName: specie.name,
          name: specie.id,
          category: "Boundary Species",

          setName: `[${specie.id}]_0`,
          defaultValue: specie.initial_concentration,
        });
      } else {
        variables.push({
          type: "normal",
          defaultDisplayName: `${specie.name}'`,
          name: `${specie.id}.Rate`,
          category: "Rate of Changes",
        });

        variables.push({
          type: "settable",
          defaultDisplayName: specie.name,
          name: specie.id,
          category: "Floating Species",

          setName: `[${specie.name}]_0`,
          defaultValue: specie.initial_concentration,
        });
      }
    }

    for (const param of modelInfo.global_parameters) {
      variables.push({
        type: "settable",
        defaultDisplayName: param.name,
        name: param.id,
        category: "Parameters",

        setName: param.name,
        defaultValue: param.initial_value,
      });
    }

    for (const reactionId of reactionIds) {
      variables.push({
        type: "normal",
        defaultDisplayName: reactionId,
        name: reactionId,
        category: "Reaction Rates",
      });
    }

    return variables;
  }
}
