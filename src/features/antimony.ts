import { WorkerPool } from "./taskPool";
import { createWorker } from "./workers";

const antimonyWorkerPool = new WorkerPool(() => createWorker("antimony"), {
  maxWorkers: 1,
});

export const convertSbmlToAntimony = async (sbml: string): Promise<string> => {
  const result = (await antimonyWorkerPool.runTask(
    "convertSbmlToAntimony",
    {
      sbml,
    },
    null,
  )) as string;
  return result;
};

export const convertAntimonyToSbml = async (
  antimony: string,
): Promise<string> => {
  const result = (await antimonyWorkerPool.runTask(
    "convertAntimonyToSbml",
    {
      antimony,
    },
    null,
  )) as string;
  return result;
};
