import type {
  ModelId,
  UnknownIridiumData,
  UnknownMetadata,
  UnknownModelData,
  UnknownResultsData,
} from "@/features/savedData";
import type { Metadata } from "@/features/savedData";
import type { Action, ErrorResult, Result } from "@/features/taskPool";

export type ListModelsAction = Action<"listModels", null>;
export type ListModelsResult = Result<Map<ModelId, UnknownMetadata>>;

export type OpenModelAction = Action<"openModel", ModelId>;
export type OpenModelResult = Result<UnknownModelData>;

const MODELS_DIR_NAME = "models";

let rootHandle: FileSystemDirectoryHandle | null = null;
const getRootHandle = async (): Promise<FileSystemDirectoryHandle> => {
  if (rootHandle === null) {
    rootHandle = await navigator.storage.getDirectory();
  }
  return rootHandle;
};

let modelsDirHandle: FileSystemDirectoryHandle | null = null;
const getModelsDirHandle = async (): Promise<FileSystemDirectoryHandle> => {
  if (modelsDirHandle === null) {
    const root = await getRootHandle();
    modelsDirHandle = await root.getDirectoryHandle(MODELS_DIR_NAME, {
      create: true,
    });
  }
  return modelsDirHandle;
};

const getJsonFileContents = async (
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<unknown> => {
  const handle = await dir.getFileHandle(name);
  const file = await handle.getFile();
  return JSON.parse(await file.text());
};

const listModels = async (): Promise<ListModelsResult["data"]> => {
  const map = new Map<ModelId, Metadata>();
  const modelsDirectory = await getModelsDirHandle();

  for await (const [id, handle] of modelsDirectory.entries()) {
    if (handle.kind !== "directory") continue;
    const dir = handle as FileSystemDirectoryHandle;
    try {
      const metadata = (await getJsonFileContents(
        dir,
        "metadata.json",
      )) as UnknownMetadata;
      map.set(id as ModelId, metadata);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotFoundError") {
        // skip if it is not shaped correctly
        continue;
      } else {
        throw err;
      }
    }
  }

  return map;
};

class ModelHandle {
  id: ModelId;
  #dirHandle!: FileSystemDirectoryHandle;
  #codeHandle!: FileSystemSyncAccessHandle;
  #metadataHandle!: FileSystemSyncAccessHandle;
  #iridiumHandle!: FileSystemSyncAccessHandle;
  #resultsHandle!: FileSystemSyncAccessHandle;

  static #current: ModelHandle | null = null;

  private constructor(id: ModelId) {
    this.id = id;
  }

  /**
   * Open a ModelHandle for the given model, if the model does not exist, create it.
   * @throws if something happens while trying to acquire the file handles (e.g. someone else has it open)
   * @throws if another model is currently opened by the app
   */
  static async open(id: ModelId): Promise<ModelHandle> {
    if (this.#current) {
      throw new Error("another model is already open");
    }

    const model = new ModelHandle(id);
    const modelsDirectory = await getModelsDirHandle();
    model.#dirHandle = await modelsDirectory.getDirectoryHandle(id as string, {
      create: true,
    });
    model.#codeHandle = await (
      await model.#dirHandle.getFileHandle("source.ant", { create: true })
    ).createSyncAccessHandle();
    model.#metadataHandle = await (
      await model.#dirHandle.getFileHandle("metadata.json", { create: true })
    ).createSyncAccessHandle();
    model.#iridiumHandle = await (
      await model.#dirHandle.getFileHandle("iridium.json", { create: true })
    ).createSyncAccessHandle();
    model.#resultsHandle = await (
      await model.#dirHandle.getFileHandle("results.json", { create: true })
    ).createSyncAccessHandle();

    ModelHandle.#current = model;
    return model;
  }

  static getCurrent(): ModelHandle | null {
    return ModelHandle.#current;
  }

  /**
   * Dump the whole contents of a file into a string.
   */
  static #readHandleIntoString(handle: FileSystemSyncAccessHandle): string {
    const buffer = new DataView(new ArrayBuffer(handle.getSize()));
    handle.read(buffer, { at: 0 });

    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  getData(): UnknownModelData {
    const code = ModelHandle.#readHandleIntoString(this.#codeHandle);
    const metadata = JSON.parse(
      ModelHandle.#readHandleIntoString(this.#metadataHandle),
    ) as UnknownMetadata;
    const iridium = JSON.parse(
      ModelHandle.#readHandleIntoString(this.#iridiumHandle),
    ) as UnknownIridiumData;
    const results = JSON.parse(
      ModelHandle.#readHandleIntoString(this.#resultsHandle),
    ) as UnknownResultsData;
    return { code, metadata, iridium, results };
  }

  dispose(): void {
    this.#codeHandle.close();
    this.#metadataHandle.close();
    this.#iridiumHandle.close();
    this.#resultsHandle.close();
    ModelHandle.#current = null;
  }
}

const openModel = async (id: ModelId): Promise<OpenModelResult["data"]> => {
  const handle = await ModelHandle.open(id);
  return handle.getData();
};

const wrapResult = (action: Action, data: unknown): Result => ({
  id: action.id,
  data: data,
});

const handleAction = async (
  action: ListModelsAction | OpenModelAction,
): Promise<Result> => {
  switch (action.type) {
    case "listModels":
      return wrapResult(action, await listModels());
    case "openModel":
      return wrapResult(action, await openModel(action.payload));
    default:
      throw new Error("unknown action type");
  }
};

self.onmessage = async (e) => {
  try {
    // eslint-disable-next-line
    await handleAction(e.data);
  } catch (err) {
    self.postMessage({
      // eslint-disable-next-line
      id: e.data.id,
      errorMessage:
        err instanceof Error ? (err.stack ?? err.message) : String(err),
    } satisfies ErrorResult);

    throw err;
  }
};
