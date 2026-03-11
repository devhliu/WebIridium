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
   \- presets (these are .json but not named so)
      \- {preset name}
      \- {preset name}
      \- {preset name}
 */

import {
  migrateProjectData,
  type Metadata,
  type ProjectId,
  type ProjectData,
  getNewProjectId,
  getNewProjectData,
  type GraphSettings,
  migrateGraphSettings,
} from "./savedData";
import { WorkerPool } from "./taskPool";
import type {
  CloseCurrentProjectAction,
  CloseCurrentProjectResult,
  DeletePresetAction,
  DeletePresetResult,
  DeleteProjectAction,
  DeleteProjectResult,
  GetAllPresetNamesAction,
  GetAllPresetNamesResult,
  ListProjectsAction,
  ListProjectsResult,
  NewProjectAction,
  NewProjectResult,
  OpenProjectAction,
  OpenProjectResult,
  ReadPresetAction,
  ReadPresetResult,
  RenamePresetAction,
  RenamePresetResult,
  SaveProjectAction,
  SaveProjectResult,
  WritePresetAction,
  WritePresetResult,
} from "@/workers/FileSystemWorker";
import { createWorker } from "@/features/workers";

const fileWorker = new WorkerPool(() => createWorker("fileSystem"), {
  maxWorkers: 1,
});

/**
 * Lists the users projects/ directory and returns a map of project IDs and the
 * corresponding metadata
 *
 * Prefer to use the `projectListAtom` in `globals/project`
 */
export const listProjectsRaw = async (): Promise<Map<ProjectId, Metadata>> => {
  const result = await fileWorker.runTask<
    ListProjectsAction,
    ListProjectsResult
  >("listProjects", null, null);

  return result;
};

/**
 * Opens a project and acquires a lock for it. Creates the project if it the file
 * for it does not exist yet.
 *
 * Prefer to use the one in `useProjectActions`
 *
 * @returns the data associated with the project
 */
export const openProjectRaw = async (id: ProjectId): Promise<ProjectData> => {
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
 *
 * Prefer to use the one in `useProjectActions`
 */
export const closeCurrentProjectRaw = async (): Promise<void> => {
  await fileWorker.runTask<
    CloseCurrentProjectAction,
    CloseCurrentProjectResult
  >("closeCurrentProject", null, null);
};

/**
 * Creates a new project and returns the project id and data for it.
 *
 * Prefer to use the one in `useProjectActions`
 *
 * @param name - default name of them project
 * @param code - default code of the project
 */
export const newProjectRaw = async (
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
export const saveProjectRaw = async (
  data: Partial<ProjectData>,
): Promise<void> => {
  await fileWorker.runTask<SaveProjectAction, SaveProjectResult>(
    "saveProject",
    data,
    null,
  );
};

/**
 * Delete a project.
 * @throws if the project is already deleted or is being edited.
 *
 * Prefer to use the one in `useProjectActions`
 */
export const deleteProjectRaw = async (id: ProjectId): Promise<void> => {
  await fileWorker.runTask<DeleteProjectAction, DeleteProjectResult>(
    "deleteProject",
    id,
    null,
  );
};

/**
 * Write to a preset. Not guaranteed to go through. May error.
 */
export const writePresetRaw = async (
  name: string,
  settings: GraphSettings,
): Promise<void> => {
  await fileWorker.runTask<WritePresetAction, WritePresetResult>(
    "writePreset",
    { name, settings },
    null,
  );
};

/**
 * Read a preset. Not guaranteed to be successful. May error.
 */
export const readPresetRaw = async (name: string): Promise<GraphSettings> => {
  const settings = await fileWorker.runTask<ReadPresetAction, ReadPresetResult>(
    "readPreset",
    name,
    null,
  );
  return migrateGraphSettings(settings);
};

/**
 * Delete a preset. Not guaranteed to go through. May error.
 */
export const deletePresetRaw = async (name: string): Promise<void> => {
  await fileWorker.runTask<DeletePresetAction, DeletePresetResult>(
    "deletePreset",
    name,
    null,
  );
};

/**
 * Rename a preset. Not guaranteed to go through. May error.
 */
export const renamePresetRaw = async (
  oldName: string,
  newName: string,
  settings: GraphSettings,
): Promise<void> => {
  await fileWorker.runTask<RenamePresetAction, RenamePresetResult>(
    "renamePreset",
    { oldName, newName, settings },
    null,
  );
};

/**
 * Get a list of all preset name.
 */
export const getAllPresetNamesRaw = async (): Promise<string[]> => {
  return await fileWorker.runTask<
    GetAllPresetNamesAction,
    GetAllPresetNamesResult
  >("getAllPresetNames", null, null);
};
