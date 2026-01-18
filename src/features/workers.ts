/**
 * Use this to make workers.
 * Mostly meant to be mocked.
 */

import FileSystemWorker from "@/workers/FileSystemWorker?worker";

export type WorkerType = "fileSystem" | "copasi" | "antimony" | "libsbmlsim";

export const createWorker = (type: WorkerType): Worker => {
  switch (type) {
    case "fileSystem":
      return new FileSystemWorker();
    case "copasi":
      return new Worker(import.meta.env.BASE_URL + "/copasiWorker.js");
    case "libsbmlsim":
      return new Worker(import.meta.env.BASE_URL + "/libsbmlsimWorker.js");
    case "antimony":
      return new Worker(import.meta.env.BASE_URL + "/antimonyWorker.js");
  }
};
