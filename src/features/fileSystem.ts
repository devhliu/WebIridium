/*
 Directory structure:
   \- projects
      \- {project UUID}
        \- metadata.json: this contains the name, creation date, updated date
        \- iridium.json: WebIridium-specific parts of the project such as graph settings
        \- results.json: results stored from every simulation
        \- project.ant: the actual antimony
      \- {project UUID}: another project
        \- metadata.json
        \- iridium.json
        \- results.json
         \- project.ant
 */

import defaultModel from "@/assets/default.ant?raw";
import {
  migrateProjectData,
  type Metadata,
  type ProjectId,
  type ProjectData,
} from "./savedData";
import { WorkerPool } from "./taskPool";
import type {
  CloseCurrentProjectAction,
  CloseCurrentProjectResult,
  ListProjectsAction,
  ListProjectsResult,
  NewProjectAction,
  NewProjectResult,
  OpenProjectAction,
  OpenProjectResult,
} from "@/workers/FileSystemWorker";
import { defaultGraphSettings } from "@/globals/settings";
import { getRandomCssGradient } from "./cssGradients";
import { createWorker } from "./workers";

const fileWorker = new WorkerPool(() => createWorker("fileSystem"), {
  maxWorkers: 1,
});

/**
 * Lists the users projects/ directory and returns a map of project IDs and the
 * corresponding metadata
 */
export const listProjects = async (): Promise<Map<ProjectId, Metadata>> => {
  const result = await fileWorker.runTask<
    ListProjectsAction,
    ListProjectsResult
  >("listProjects", null, null);

  return result;
};

/**
 * Opens a project and acquires a lock for it. Creates the project if it the file
 * for it does not exist yet.
 * @returns the data associated with the project
 */
export const openProject = async (id: ProjectId): Promise<ProjectData> => {
  const result = await fileWorker.runTask<OpenProjectAction, OpenProjectResult>(
    "openProject",
    id,
    null,
  );
  return migrateProjectData(result);
};

/**
 * Closes the current project. The project ID parameter should match the currently open
 * project (by the worker), otherwise this will throw.
 */
export const closeCurrentProject = async (): Promise<void> => {
  await fileWorker.runTask<
    CloseCurrentProjectAction,
    CloseCurrentProjectResult
  >("closeCurrentProject", null, null);
};

const getNewProjectId = (): ProjectId => crypto.randomUUID() as ProjectId;

/** exported so it can be used in mocks */
export const getNewProjectData = (): ProjectData => {
  return {
    code: defaultModel,
    metadata: {
      versionTag: 1,
      name: "Starter Project",
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
 * Creates a new project and returns the project id and data for it.
 * @param name - default name of them project
 * @param code - default code of the project
 */
export const newProject = async (
  name?: string,
  code?: string,
): Promise<[ProjectId, ProjectData]> => {
  const id = getNewProjectId();
  const data = getNewProjectData();

  if (name !== undefined) {
    data.metadata.name = name;
  }

  if (code !== undefined) {
    data.code = code;
  }

  await fileWorker.runTask<NewProjectAction, NewProjectResult>(
    "newProject",
    { id, data },
    null,
  );
  return [id, data];
};
