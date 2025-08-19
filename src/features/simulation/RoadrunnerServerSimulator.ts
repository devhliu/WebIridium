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

type ActionBase = {
  id: string;
  code: string;
};

type LoadModelAction = ActionBase & {
  type: "loadModel";
};
type TimeCourseAction = ActionBase & {
  type: "timeCourse";
  startTime: number;
  endTime: number;
  numberOfPoints: number;
  resetInitialConditions: boolean;
  selectionList: string[];
  variableValues: Record<string, number>;
  parameterScanOptions?: ParameterScanOptions;
};
type SteadyStateAction = ActionBase & {
  type: "steadyState";
  variableValues: Record<string, number>;
  parameterScanOptions?: ParameterScanOptions;
};

type Action = LoadModelAction | TimeCourseAction | SteadyStateAction;

type ResponseBase = {
  id: string;
};

type LoadModelResponse = ResponseBase & {
  type: "loadModel";
  floatingSpecies: Record<string, number>;
  boundarySpecies: Record<string, number>;
  reactions: string[];
  parameters: Record<string, number>;
};

type TimeCourseResponse = ResponseBase & {
  type: "timeCourse";
  columnNames: string[];
  rows: number[][];
};

type SteadyStateResponse = ResponseBase & {
  type: "steadyState";
};

/**
 * Simulator that uses external RoadRunner WebSocket server.
 */
export class RoadrunnerServerSimulator extends Simulator {
  defaultIndependentVariableId = "time";
  scanIndependentVariableId = "time";

  #socket: WebSocket;
  #pendingActions: Map<
    string,
    {
      action: Action;
      resolve: (value: unknown) => void;
      reject: (error: unknown) => void;
    }
  >;

  #actionIdCounter: number;

  constructor() {
    super();
    this.#pendingActions = new Map();
    this.#actionIdCounter = 0;

    // TODO: make these configurable
    this.#socket = new WebSocket("ws://localhost:47137");

    this.#socket.addEventListener("on", () => {
      console.log("Socket connected");
    });

    this.#socket.addEventListener("close", () => {
      console.log("Socket closing");
    });

    this.#socket.addEventListener("error", (err) => {
      console.error(err);
    });

    this.#socket.addEventListener("message", (event) => {
      // TODO!IMPORTANT: validate
      const data = JSON.parse(event.data);
      if (data.id) {
        const action = this.#pendingActions.get(data.id);
        if (action) {
          this.#pendingActions.delete(data.id);
          action.resolve(data);
        }
      }
    });
  }

  #delegateAction(action: Action): Promise<unknown> {
    if (this.#socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not open.");
    }

    return new Promise((resolve, reject) => {
      this.#pendingActions.set(action.id, { action, resolve, reject });
      this.#socket.send(JSON.stringify(action));
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
    const result = (await this.#delegateAction({
      type: "timeCourse",
      id: (this.#actionIdCounter++).toString(),
      code: antimonyCode,
      startTime: parameters.startTime,
      endTime: parameters.endTime,
      numberOfPoints: parameters.numberOfPoints,
      resetInitialConditions: parameters.resetInitialConditions,
      selectionList: parameters.includedVariables.map((v) => v.name),
      variableValues: variableValues,
      parameterScanOptions: parameterScanOptions,
    } satisfies TimeCourseAction)) as TimeCourseResponse;

    const r = {
      type: "timeCourse",
      columns: result.columnNames.map((name, i) => ({
        title: name,
        values: result.rows.map((row) => row[i]),
      })),
      columnSet: new Set(result.columnNames),
    };

    console.log(r);
    return r;
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
    const result = (await this.#delegateAction({
      type: "loadModel",
      id: this.#getNextActionId(),
      code: antimonyCode,
    } satisfies LoadModelAction)) as LoadModelResponse;

    console.log(result);

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

  #getNextActionId(): string {
    return (this.#actionIdCounter++).toString();
  }
}
