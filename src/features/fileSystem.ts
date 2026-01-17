/*
 Directory structure:
   \- models
      \- {model UUID}
        \- metadata.json: this contains the name, creation date, updated date
        \- iridium.json: WebIridium-specific parts of the model such as graph settings
        \- results.json: results stored from every simulation
        \- model.ant: the actual antimony
      \- {model UUID}: another model
        \- metadata.json
        \- iridium.json
        \- results.json
         \- model.ant
 */

import FileSystemWorker from "@/workers/FileSystemWorker?worker";
import {
  type UnknownModelData,
  type Metadata,
  type ModelId,
  migrateMetadata,
} from "./savedData";
import { WorkerPool } from "./taskPool";
import type {
  ListModelsAction,
  ListModelsResult,
  OpenModelAction,
  OpenModelResult,
} from "@/workers/FileSystemWorker";
import { useEffect, useRef, useState } from "react";

const fileWorker = new WorkerPool(() => new FileSystemWorker(), {
  maxWorkers: 1,
});

/**
 * Lists the users moodels/ directory and returns a map of model IDs and the
 * corresponding metadata
 */
export const listModels = async (): Promise<Map<ModelId, Metadata>> => {
  const result = await fileWorker.runTask<ListModelsAction, ListModelsResult>(
    "listModels",
    null,
    null,
  );

  return result;
};

/**
 * Opens a model and acquires a lock for it. Creates the model if it the file
 * for it does not exist yet.
 * @returns the data associated with the model
 */
export const openModel = async (id: ModelId): Promise<UnknownModelData> => {
  const result = await fileWorker.runTask<OpenModelAction, OpenModelResult>(
    "openModel",
    id,
    null,
  );
  return result;
};

/**
 * Hook to get a list of models.
 * NOTE: does not update if new models are added.
 */
export const useModelList = () => {
  const [models, setModels] = useState<Map<ModelId, Metadata>>(new Map());
  const didRunRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      didRunRef.current = true;

      const models = await listModels();
      const migratedModels = new Map(
        Array.from(models.entries()).map(([id, metadata]) => [
          id,
          migrateMetadata(metadata),
        ]),
      );
      setModels(migratedModels);
    };

    if (!didRunRef.current) {
      void run();
    }
  }, []);

  return { models };
};
