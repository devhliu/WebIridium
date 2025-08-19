// TODO: Add automatically killing unused workers.

/**
 * TaskPool is an abstract class for that manages tasks asynchronously.
 * Run tasks using the `runTask` method.
 *
 * There are two implementations:
 *  - WorkerPool, which runs tasks inside WebWorkers.
 *  - SocketPool, which runs tasks from a server (via WebSocket).
 *
 * When comments refer "task runner" it is either a web worker or web socket.
 */

export type Action = {
  id: number;
  type: string;
  payload: unknown;

  /**
   * This value is synchronized with the actual task runner. It is only sent to
   * the runner when changed.
   * For simulationWorker, "internalState" is the antimony code.
   */
  internalState: unknown;
};

export type Result = {
  /**
   * This should be the same as the id of the action that
   * triggered this result.
   */
  id: number;
  data: unknown;
};

export type ErrorResult = {
  id: number;
  errorMessage: string;
};

export type WorkerPoolOptions = {
  maxWorkers?: number;
};

type Task<RunnerInfo> = {
  id: number;
  state: "waiting" | "working" | "done" | "terminated" | "failed";
  actionType: string;
  payload: unknown;
  internalState: unknown;
  resolve: (res: unknown) => void;
  reject: (reason: unknown) => void;
  /**
   * For worker pools, this is the Worker info of worker currently working on this task.
   * For socket pools, this is the raw WebSocket.
   **/
  runnerInfo?: RunnerInfo;
};

type WorkerInfo = {
  worker: Worker;
  state: "idle" | "busy" | "dead";
  /** For tracking the internalState of the actual worker. */
  internalState: unknown;
};

/**
 * Manages tasks asychronously, dispatching them to a "task runner" (either WebSocket or WebWorker) to run.
 */
export abstract class TaskPool<RunnerInfo> {
  _tasks: Task<RunnerInfo>[];
  #idCounter: number = 0;

  constructor() {
    this._tasks = [];
  }

  /**
   *
   * @param type - the type of task (the task runner should use this to know what task to run)
   * @param payload - extra data to send to the task runner
   * @param internalState - Internal data to sychronize with the task runner.
   *                        This data is only sent if it has changed since the
   *                        last run.
   */
  runTask(
    type: string,
    payload: unknown,
    internalState: unknown,
    abortSignal?: AbortSignal,
  ): Promise<unknown> {
    const id = this.#idCounter++;
    return new Promise((resolve, reject) => {
      const task: Task<RunnerInfo> = {
        id,
        resolve,
        reject,
        payload,
        internalState,
        actionType: type,
        state: "waiting" as const,
      };

      this._tasks.push(task);

      if (abortSignal) {
        abortSignal.addEventListener("abort", () => {
          this._terminateTask(task);
        });

        if (abortSignal.aborted) {
          this._terminateTask(task);
          return;
        }
      }

      const runnerInfo = this._getAvailableRunner();
      if (runnerInfo) {
        this._startTask(runnerInfo, task);
      }
    });
  }

  _getAvailableTask(): Task<RunnerInfo> | undefined {
    return this._tasks.find((t) => t.state === "waiting");
  }

  abstract _getAvailableRunner(): RunnerInfo | null;

  /**
   * Runs task in the giver runner.
   * THE RUNNER MUST BE AVAILABLE!
   */
  _startTask(runnerInfo: RunnerInfo, task: Task<RunnerInfo>) {
    if (task.state === "terminated") {
      throw new Error("cannot start terminated task");
    } else if (task.state == "failed") {
      throw new Error("cannot start a failed task");
    }

    task.state = "working";
    task.runnerInfo = runnerInfo;

    this._delegateTask(task, runnerInfo);
  }

  /**
   * Delegates a task to a runner.
   */
  abstract _delegateTask(task: Task<RunnerInfo>, runnerInfo: RunnerInfo): void;

  _terminateTask(task: Task<RunnerInfo>): void {
    if (task.state === "waiting" || task.state === "working") {
      const index = this._tasks.indexOf(task);
      this._tasks.splice(index, 1);

      task.state = "terminated";
      task.reject(new TaskTermination());
      if (task.runnerInfo) {
        this._stopTask(task, task.runnerInfo);
      }
    }
  }

  /**
   * Stop a task from finishing.
   */
  abstract _stopTask(task: Task<RunnerInfo>, runnerInfo: RunnerInfo): void;
}

/**
 * give this worker pool tasks, it will find a worker to do the task
 * and return the result. Pass a `createWorker` function so the worker
 * can create workers to do its tasks.
 *
 * THIS DOES NOT ACCEPT ANY OLD WORKER. When you post a message to a worker created by
 * this worker pool, it must accept Action as the message's data. It must pass Result with the same id
 * back to the main thread.
 *
 * See `/public/simulationWorker.js` for an example of what a worker
 * used by this worker pool should look like.
 */
export class WorkerPool extends TaskPool<WorkerInfo> {
  readonly maxWorkers: number;

  #createWorker: () => Worker;
  #workers: WorkerInfo[];

  constructor(
    createWorker: () => Worker,
    { maxWorkers = 3 }: WorkerPoolOptions = {},
  ) {
    super();
    this.maxWorkers = maxWorkers;

    this.#createWorker = createWorker;
    this.#workers = [];
  }

  _delegateTask(task: Task<WorkerInfo>, workerInfo: WorkerInfo): void {
    workerInfo.state = "busy";
    workerInfo.worker.postMessage({
      type: task.actionType,
      id: task.id,
      payload: task.payload,
      internalState:
        workerInfo.internalState !== task.internalState
          ? task.internalState
          : undefined,
    } as Action);

    if (workerInfo !== task.internalState) {
      workerInfo.internalState = task.internalState;
    }
  }

  _getAvailableRunner(): WorkerInfo | null {
    const worker = this.#workers.find((w) => w.state === "idle");
    if (worker) {
      return worker;
    } else if (this.#workers.length >= this.maxWorkers) {
      return null;
    } else {
      const newWorker = this.#createWorker();
      const newWorkerInfo: WorkerInfo = {
        state: "idle",
        worker: newWorker,
        internalState: null,
      };
      this.#initializeWorker(newWorkerInfo);
      this.#workers.push(newWorkerInfo);
      return newWorkerInfo;
    }
  }

  #initializeWorker(workerInfo: WorkerInfo) {
    workerInfo.worker.addEventListener(
      "message",
      (e: MessageEvent<Result | ErrorResult>) => {
        const taskIndex = this._tasks.findIndex((t) => t.id === e.data.id);
        if (taskIndex >= 0) {
          const task = this._tasks[taskIndex];
          this._tasks.splice(taskIndex, 1);
          if ("errorMessage" in e.data) {
            task.state = "failed";
            task.runnerInfo = undefined;
            task.reject(new Error(e.data.errorMessage));
          } else {
            task.state = "done";
            task.runnerInfo = undefined;
            task.resolve(e.data.data);
          }
        }

        const availableTask = this._getAvailableTask();
        if (availableTask) {
          this._startTask(workerInfo, availableTask);
        } else {
          workerInfo.state = "idle";
        }
      },
    );
  }

  _stopTask(_: Task<WorkerInfo>, workerInfo: WorkerInfo) {
    workerInfo.state = "dead";
    workerInfo.worker.terminate();

    const index = this.#workers.indexOf(workerInfo);
    this.#workers.splice(index, 1);
  }
}

export class TaskTermination extends Error {}
