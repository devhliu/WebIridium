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

import defaultModel from "@/assets/default.ant?raw";
import {
  migrateModelData,
  type Metadata,
  type ModelId,
  type ModelData,
} from "./savedData";
import { WorkerPool } from "./taskPool";
import type {
  CloseCurrentModelAction,
  CloseCurrentModelResult,
  ListModelsAction,
  ListModelsResult,
  NewModelAction,
  NewModelResult,
  OpenModelAction,
  OpenModelResult,
} from "@/workers/FileSystemWorker";
import { defaultGraphSettings } from "@/globals/settings";
import { getRandomCssGradient } from "./cssGradients";
import { createWorker } from "./workers";

const fileWorker = new WorkerPool(() => createWorker("fileSystem"), {
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
export const openModel = async (id: ModelId): Promise<ModelData> => {
  const result = await fileWorker.runTask<OpenModelAction, OpenModelResult>(
    "openModel",
    id,
    null,
  );
  return migrateModelData(result);
};

/**
 * Closes the current model. The model ID parameter should match the currently open
 * model (by the worker), otherwise this will throw.
 */
export const closeCurrentModel = async (): Promise<void> => {
  await fileWorker.runTask<CloseCurrentModelAction, CloseCurrentModelResult>(
    "closeCurrentModel",
    null,
    null,
  );
};

const getNewModelId = (): ModelId => crypto.randomUUID() as ModelId;

/** exported so it can be used in mocks */
export const getNewModelData = (): ModelData => {
  return {
    code: defaultModel,
    metadata: {
      versionTag: 1,
      name: "Default Model",
      created: Date.now(),
      updated: Date.now(),
      icon: {
        color: getRandomCssGradient(),
      },
    },
    iridium: {
      versionTag: 1,
      graphSettings: defaultGraphSettings,
      variableSettings: {},
    },
    results: {
      versionTag: 1,
      records: [],
    },
  };
};

/**
 * Creates a new model and returns the model id and data for it.
 * @param name - default name of them model
 * @param code - default code of the model
 */
export const newModel = async (
  name?: string,
  code?: string,
): Promise<[ModelId, ModelData]> => {
  const id = getNewModelId();
  const data = getNewModelData();

  if (name !== undefined) {
    data.metadata.name = name;
  }

  if (code !== undefined) {
    data.code = code;
  }

  await fileWorker.runTask<NewModelAction, NewModelResult>(
    "newModel",
    { id, data },
    null,
  );
  return [id, data];
};
