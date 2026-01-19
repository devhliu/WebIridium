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

import {
  migrateProjectData,
  type Metadata,
  type ProjectId,
  type ProjectData,
  getNewProjectId,
  getNewProjectData,
} from "./projectData";
import { WorkerPool } from "./taskPool";
import type {
  CloseCurrentProjectAction,
  CloseCurrentProjectResult,
  DeleteProjectAction,
  DeleteProjectResult,
  ListProjectsAction,
  ListProjectsResult,
  NewProjectAction,
  NewProjectResult,
  OpenProjectAction,
  OpenProjectResult,
  SaveProjectAction,
  SaveProjectResult,
} from "@/workers/FileSystemWorker";
import { createWorker } from "@/features/workers";

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

/**
 * Save part of or all of project data.
 * You should prefer to use the saveAtom in globals/saving.
 */
export const saveProject = async (
  data: Partial<ProjectData>,
): Promise<void> => {
  await fileWorker.runTask<SaveProjectAction, SaveProjectResult>(
    "saveProject",
    data,
    null,
  );
};

export const deleteProject = async (id: ProjectId): Promise<void> => {
  await fileWorker.runTask<DeleteProjectAction, DeleteProjectResult>(
    "deleteProject",
    id,
    null,
  );
};
