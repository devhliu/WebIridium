import type {
  GraphSettings,
  ProjectData,
  ProjectId,
  UnknownGraphSettings,
  UnknownIridiumData,
  UnknownMetadata,
  UnknownProjectData,
  UnknownResultsData,
} from "@/features/savedData";
import type { Metadata } from "@/features/savedData";
import type { Action, Result } from "@/features/taskPool";
import wrapActionHandler from "./wrapActionHandler";

export type ListProjectsAction = Action<"listProjects", null>;
export type ListProjectsResult = Result<Map<ProjectId, UnknownMetadata>>;

export type OpenProjectAction = Action<"openProject", ProjectId>;
export type OpenProjectResult = Result<UnknownProjectData>;

export type CloseCurrentProjectAction = Action<"closeCurrentProject", null>;
export type CloseCurrentProjectResult = Result<null>;

export type NewProjectAction = Action<
  "newProject",
  {
    id: ProjectId;
    data: ProjectData;
  }
>;
export type NewProjectResult = Result<null>;

export type SaveProjectAction = Action<"saveProject", Partial<ProjectData>>;
export type SaveProjectResult = Result<null>;

export type DeleteProjectAction = Action<"deleteProject", ProjectId>;
export type DeleteProjectResult = Result<null>;

export type WritePresetAction = Action<
  "writePreset",
  {
    name: string;
    settings: GraphSettings;
  }
>;
export type WritePresetResult = Result<null>;

export type ReadPresetAction = Action<"readPreset", string>;
export type ReadPresetResult = Result<UnknownGraphSettings>;

export type RenamePresetAction = Action<
  "renamePreset",
  {
    oldName: string;
    newName: string;
    settings: GraphSettings;
  }
>;
export type RenamePresetResult = Result<null>;

export type DeletePresetAction = Action<"deletePreset", string>;
export type DeletePresetResult = Result<null>;

export type GetAllPresetNamesAction = Action<"getAllPresetNames">;
export type GetAllPresetNamesResult = Result<string[]>;

export type FileSystemAction =
  | ListProjectsAction
  | OpenProjectAction
  | CloseCurrentProjectAction
  | NewProjectAction
  | SaveProjectAction
  | DeleteProjectAction
  | WritePresetAction
  | ReadPresetAction
  | RenamePresetAction
  | DeletePresetAction
  | GetAllPresetNamesAction;

const PROJECTS_DIR_NAME = "projects";
const PRESETS_DIR_NAME = "presets";

let rootHandle: FileSystemDirectoryHandle | null = null;
const getRootHandle = async (): Promise<FileSystemDirectoryHandle> => {
  if (rootHandle === null) {
    rootHandle = await navigator.storage.getDirectory();
  }
  return rootHandle;
};

let projectsDirHandle: FileSystemDirectoryHandle | null = null;
const getProjectsDirHandle = async (): Promise<FileSystemDirectoryHandle> => {
  if (projectsDirHandle === null) {
    const root = await getRootHandle();
    projectsDirHandle = await root.getDirectoryHandle(PROJECTS_DIR_NAME, {
      create: true,
    });
  }
  return projectsDirHandle;
};

let presetsDirHandle: FileSystemDirectoryHandle | null = null;
const getPresetsDirHandle = async (): Promise<FileSystemDirectoryHandle> => {
  if (presetsDirHandle === null) {
    const root = await getRootHandle();
    presetsDirHandle = await root.getDirectoryHandle(PRESETS_DIR_NAME, {
      create: true,
    });
  }
  return presetsDirHandle;
};

const getJsonFileContents = async (
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<unknown> => {
  const handle = await dir.getFileHandle(name);
  const file = await handle.getFile();
  return JSON.parse(await file.text());
};

/**
 * Retries an action everytime a DOMException occurs, with exponential backoff.
 * Gives up after 5 tries.
 */
const runWithRetry = async <T>(action: () => Promise<T>): Promise<T> => {
  let timeout = 50;
  let tries = 0;
  const wrap = async () => {
    try {
      return await action();
    } catch (e) {
      if (e instanceof DOMException) {
        timeout *= 2;
        tries += 1;
        if (tries < 5) {
          await new Promise((resolve) => setTimeout(resolve, timeout));
          return await wrap();
        }
      }
      throw e;
    }
  };

  return await wrap();
};

const listProjects = async (): Promise<ListProjectsResult["data"]> => {
  const map = new Map<ProjectId, Metadata>();
  const projectsDirectory = await getProjectsDirHandle();

  for await (const [id, handle] of projectsDirectory.entries()) {
    if (handle.kind !== "directory") continue;
    const dir = handle as FileSystemDirectoryHandle;
    try {
      const metadata = (await getJsonFileContents(
        dir,
        "metadata.json",
      )) as UnknownMetadata;
      map.set(id as ProjectId, metadata);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotFoundError") {
        continue;
      } else {
        throw err;
      }
    }
  }

  return map;
};

/**
 * Dump the whole contents of a file into a string.
 */
const readHandleIntoString = (handle: FileSystemSyncAccessHandle): string => {
  const buffer = new DataView(new ArrayBuffer(handle.getSize()));
  handle.read(buffer, { at: 0 });

  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

const writeStringToHandle = (
  handle: FileSystemSyncAccessHandle,
  data: string,
): void => {
  const encoder = new TextEncoder();
  const array = encoder.encode(data);
  handle.truncate(0);
  handle.write(array, { at: 0 });
  handle.flush();
};

class ProjectHandle {
  id: ProjectId;
  #dirHandle!: FileSystemDirectoryHandle;
  #codeHandle!: FileSystemSyncAccessHandle;
  #metadataHandle!: FileSystemSyncAccessHandle;
  #iridiumHandle!: FileSystemSyncAccessHandle;
  #resultsHandle!: FileSystemSyncAccessHandle;

  static #current: ProjectHandle | null = null;

  private constructor(id: ProjectId) {
    this.id = id;
  }

  /**
   * Open a ProjectHandle for the given project, if the project does not exist, create it.
   * @throws if something happens while trying to acquire the file handles (e.g. someone else has it open)
   * @throws if another project is currently opened by the app
   */
  static async open(
    id: ProjectId,
    { create = false }: { create?: boolean } = {},
  ): Promise<ProjectHandle> {
    if (this.#current) {
      this.#current.dispose();
    }

    const project = new ProjectHandle(id);
    const projectsDirectory = await getProjectsDirHandle();
    project.#dirHandle = await projectsDirectory.getDirectoryHandle(id, {
      create,
    });
    project.#codeHandle = await (
      await project.#dirHandle.getFileHandle("source.ant", { create })
    ).createSyncAccessHandle();
    project.#metadataHandle = await (
      await project.#dirHandle.getFileHandle("metadata.json", { create })
    ).createSyncAccessHandle();
    project.#iridiumHandle = await (
      await project.#dirHandle.getFileHandle("iridium.json", { create })
    ).createSyncAccessHandle();
    project.#resultsHandle = await (
      await project.#dirHandle.getFileHandle("results.json", { create })
    ).createSyncAccessHandle();

    ProjectHandle.#current = project;
    return project;
  }

  static getCurrent(): ProjectHandle | null {
    return ProjectHandle.#current;
  }

  setData(data: Partial<ProjectData>): void {
    if (data.code !== undefined) {
      writeStringToHandle(this.#codeHandle, data.code);
    }

    if (data.metadata !== undefined) {
      writeStringToHandle(this.#metadataHandle, JSON.stringify(data.metadata));
    }

    if (data.iridium !== undefined) {
      writeStringToHandle(this.#iridiumHandle, JSON.stringify(data.iridium));
    }

    if (data.results !== undefined) {
      writeStringToHandle(this.#resultsHandle, JSON.stringify(data.results));
    }
  }

  getData(): UnknownProjectData {
    const code = readHandleIntoString(this.#codeHandle);
    const metadata = JSON.parse(
      readHandleIntoString(this.#metadataHandle),
    ) as UnknownMetadata;
    const iridium = JSON.parse(
      readHandleIntoString(this.#iridiumHandle),
    ) as UnknownIridiumData;
    const results = JSON.parse(
      readHandleIntoString(this.#resultsHandle),
    ) as UnknownResultsData;
    return { code, metadata, iridium, results };
  }

  dispose(): void {
    this.#codeHandle.close();
    this.#metadataHandle.close();
    this.#iridiumHandle.close();
    this.#resultsHandle.close();
    ProjectHandle.#current = null;
  }
}

const openProject = async (
  id: ProjectId,
): Promise<OpenProjectResult["data"]> => {
  try {
    const handle = await ProjectHandle.open(id);
    return handle.getData();
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === "NoModificationAllowedError"
    ) {
      throw new Error("Project is already open in another tab.");
    } else if (err instanceof DOMException && err.name === "NotFoundError") {
      throw new Error("Project was deleted somewhere else.");
    }
    throw err;
  }
};

const newProject = async (
  id: ProjectId,
  data: ProjectData,
): Promise<NewProjectResult["data"]> => {
  const handle = await ProjectHandle.open(id, { create: true });
  handle.setData(data);
  return null;
};

const closeProject = () => {
  const handle = ProjectHandle.getCurrent();
  handle?.dispose();
  return null;
};

const saveProject = (data: Partial<ProjectData>) => {
  const handle = ProjectHandle.getCurrent();
  if (!handle) throw new Error("No project opened.");
  handle.setData(data);
  return null;
};

const deleteProject = async (id: ProjectId) => {
  try {
    const projectsDirectory = await getProjectsDirHandle();
    await projectsDirectory.removeEntry(id, { recursive: true });
    return null;
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === "NoModificationAllowedError"
    ) {
      throw new Error("Project is opened in another tab.");
    } else if (err instanceof DOMException && err.name === "NotFoundError") {
      throw new Error("Project was deleted already.");
    } else {
      throw err;
    }
  }
};

const writePreset = async ({
  name,
  settings,
}: WritePresetAction["payload"]): Promise<WritePresetResult["data"]> => {
  const presetsDirectory = await getPresetsDirHandle();
  const fileHandle = await presetsDirectory.getFileHandle(name, {
    create: true,
  });

  await runWithRetry(async () => {
    const syncHandle = await fileHandle.createSyncAccessHandle();
    writeStringToHandle(syncHandle, JSON.stringify(settings));
    syncHandle.close();
  });

  return null;
};

const readPreset = async (name: string): Promise<ReadPresetResult["data"]> => {
  const presetsDirectory = await getPresetsDirHandle();
  return (await getJsonFileContents(
    presetsDirectory,
    name,
  )) as UnknownGraphSettings;
};

const renamePreset = async ({
  oldName,
  newName,
  settings,
}: RenamePresetAction["payload"]): Promise<RenamePresetResult["data"]> => {
  const presetsDirectory = await getPresetsDirHandle();

  await presetsDirectory.removeEntry(oldName);

  await runWithRetry(async () => {
    const fileHandle = await presetsDirectory.getFileHandle(newName, {
      create: true,
    });
    const syncHandle = await fileHandle.createSyncAccessHandle();
    writeStringToHandle(syncHandle, JSON.stringify(settings));
    syncHandle.close();
  });

  return null;
};

const deletePreset = async (name: string) => {
  const presetsDirectory = await getPresetsDirHandle();
  await presetsDirectory.removeEntry(name);
};

const getAllPresetNames = async (): Promise<
  GetAllPresetNamesResult["data"]
> => {
  const presetsDirectory = await getPresetsDirHandle();
  const names: string[] = [];

  for await (const [name, handle] of presetsDirectory.entries()) {
    if (handle.kind !== "file") continue;
    names.push(name);
  }

  return names;
};

const wrapResult = (action: Action, data: unknown): Result => ({
  id: action.id,
  data: data,
});

const handleAction = async (action: FileSystemAction): Promise<Result> => {
  switch (action.type) {
    case "listProjects":
      return wrapResult(action, await listProjects());
    case "openProject":
      return wrapResult(action, await openProject(action.payload));
    case "closeCurrentProject":
      return wrapResult(action, closeProject());
    case "newProject":
      return wrapResult(
        action,
        await newProject(action.payload.id, action.payload.data),
      );
    case "saveProject":
      return wrapResult(action, saveProject(action.payload));
    case "deleteProject":
      return wrapResult(action, await deleteProject(action.payload));
    case "writePreset":
      return wrapResult(action, await writePreset(action.payload));
    case "readPreset":
      return wrapResult(action, await readPreset(action.payload));
    case "renamePreset":
      return wrapResult(action, await renamePreset(action.payload));
    case "deletePreset":
      return wrapResult(action, await deletePreset(action.payload));
    case "getAllPresetNames":
      return wrapResult(action, await getAllPresetNames());
    default:
      throw new Error("unknown action type");
  }
};

self.onmessage = wrapActionHandler(self, handleAction);
