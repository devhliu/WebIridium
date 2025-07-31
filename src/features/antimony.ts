import { WorkerPool } from "./workerPool";
import { createWorker } from "./workers";

const antimonyWorkerPool = new WorkerPool(() => createWorker("antimony"), {
  maxWorkers: 1,
});

export const convertSbmlToAntimony = async (sbml: string): Promise<string> => {
  const result = (await antimonyWorkerPool.queueTask(
    "convertSbmlToAntimony",
    {
      sbml,
    },
    null,
  )) as string;
  return result;
};
