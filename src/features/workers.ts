/**
 * Use this to make workers.
 * Mostly meant to be mocked.
 */

export type WorkerType = "copasi" | "antimony" | "libsbmlsim";

export const createWorker = (type: WorkerType): Worker => {
  switch (type) {
    case "copasi":
      return new Worker(import.meta.env.BASE_URL + "/copasiWorker.js");
    case "libsbmlsim":
      return new Worker(import.meta.env.BASE_URL + "/libsbmlsimWorker.js");
    case "antimony":
      return new Worker(import.meta.env.BASE_URL + "/antimonyWorker.js");
  }
};
