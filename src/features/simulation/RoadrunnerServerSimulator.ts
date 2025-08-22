import { SocketTaskPool } from "../taskPool";
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

type TimeCourseAction = {
  startTime: number;
  endTime: number;
  numberOfPoints: number;
  resetInitialConditions: boolean;
  selectionList: string[];
  variableValues: Record<string, number>;
  parameterScanOptions?: ParameterScanOptions;
};

// type SteadyStateAction = {
//   variableValues: Record<string, number>;
//   parameterScanOptions?: ParameterScanOptions;
// };

type LoadModelResponse = {
  floatingSpecies: Record<string, number>;
  boundarySpecies: Record<string, number>;
  reactions: string[];
  parameters: Record<string, number>;
};

type TimeCourseResponse = {
  type: "timeCourse";
  columnNames: string[];
  rows: number[][];
};

// type SteadyStateResponse = {};

/**
 * Simulator that uses external RoadRunner WebSocket server.
 */
export class RoadrunnerServerSimulator extends Simulator {
  defaultIndependentVariableId = "time";
  scanIndependentVariableId = "time";

  #socketTaskPool: SocketTaskPool;

  constructor() {
    super();
    this.#socketTaskPool = new SocketTaskPool();
    this.#socketTaskPool.connect("ws://localhost:47137");
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
    const result = (await this.#socketTaskPool.runTask(
      "timeCourse",
      {
        startTime: parameters.startTime,
        endTime: parameters.endTime,
        numberOfPoints: parameters.numberOfPoints,
        resetInitialConditions: parameters.resetInitialConditions,
        selectionList: parameters.includedVariables.map((v) => v.name),
        variableValues: variableValues,
        parameterScanOptions: parameterScanOptions,
      } satisfies TimeCourseAction,
      antimonyCode,
      abortSignal,
    )) as TimeCourseResponse;

    return {
      type: "timeCourse",
      columns: result.columnNames.map((name, i) => ({
        title: name,
        values: result.rows.map((row) => row[i]),
      })),
      columnSet: new Set(result.columnNames),
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

  async loadModel(antimonyCode: string, abortSignal?: AbortSignal) {
    const result = (await this.#socketTaskPool.runTask(
      "loadModel",
      null,
      antimonyCode,
      abortSignal,
    )) as LoadModelResponse;

    const variables: Variable[] = [];

    variables.push({
      type: "normal",
      defaultDisplayName: "Time",
      name: "time",
      category: "Time",
    });

    for (const [name, value] of Object.entries(result.floatingSpecies)) {
      variables.push({
        type: "settable",
        defaultDisplayName: name,
        name: name,
        category: "Floating Species",

        setName: `init([${name}])`,
        defaultValue: value,
      });

      variables.push({
        type: "normal",
        defaultDisplayName: `${name}'`,
        name: `${name}'`,
        category: "Rate of Changes",
      });

      variables.push({
        type: "normal",
        defaultDisplayName: `eigenReal(${name})`,
        name: `eigenReal(${name})`,
        category: "Eigenvalues",
      });

      variables.push({
        type: "normal",
        defaultDisplayName: `eigenImag(${name})`,
        name: `eigenImag(${name})`,
        category: "Eigenvalues",
      });

      for (const reactionName of result.reactions) {
        variables.push({
          type: "normal",
          defaultDisplayName: `ec(${reactionName}, ${name})`,
          name: `ec(${reactionName}, ${name})`,
          category: "Elasticities",
        });
      }
    }

    for (const [name, value] of Object.entries(result.boundarySpecies)) {
      variables.push({
        type: "settable",
        defaultDisplayName: name,
        name: name,
        category: "Boundary Species",

        setName: `init([${name}])`,
        defaultValue: value,
      });
    }

    for (const [name, value] of Object.entries(result.parameters)) {
      variables.push({
        type: "settable",
        defaultDisplayName: name,
        name: name,
        category: "Parameters",

        setName: name,
        defaultValue: value,
      });

      for (const reactionName of result.reactions) {
        variables.push({
          type: "normal",
          defaultDisplayName: `ec(${reactionName}, ${name})`,
          name: `ec(${reactionName}, ${name})`,
          category: "Elasticities",
        });
      }
    }

    for (const name of result.reactions) {
      variables.push({
        type: "normal",
        defaultDisplayName: name,
        name: name,
        category: "Reaction Rates",
      });
    }

    return variables;
  }
}
