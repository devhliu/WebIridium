import { atom, useSetAtom, type Atom } from "jotai";
import { loadable } from "jotai/utils";
import {
  migrateMetadata,
  type Metadata,
  type ModelData,
  type ModelId,
} from "@/features/savedData";
import { listModels, newModel, openModel } from "@/features/fileSystem";
import { useToast } from "@/components/Toast";
import errorToDisplayString from "@/utils/errorToDisplayString";
import { setModelAtom } from "./model";
import { updateAllHistoryAtom } from "./history";
import { graphSettingsAtom } from "./settings";
import { useAtomValue } from "jotai";
import { currentLeftPanelAtom } from "./layout";

// Increments every time a change is made to the file system
// Other atoms should `get` this if they want to re-evaluate when the file system changes.
const _changeIdAtom = atom(0);

export const activeModelFileAtom = atom<ModelId | null>(null);
export const hasActiveModelAtom = atom(
  (get) => get(activeModelFileAtom) !== null,
);

const _modelListAtom: Atom<Promise<Map<ModelId, Metadata>>> = atom(
  async (get) => {
    // do this to update the atom on any file system changes
    get(_changeIdAtom);

    const models = await listModels();
    const migratedModels = new Map(
      Array.from(models.entries()).map(([id, metadata]) => [
        id,
        migrateMetadata(metadata),
      ]),
    );

    return migratedModels;
  },
);
export const modelListAtom = loadable(_modelListAtom);

const _updateGlobalsFromModelDataAtom = atom(
  null,
  async (
    _get,
    set,
    [id, { metadata, iridium, code, results }]: [ModelId, ModelData],
  ) => {
    set(updateAllHistoryAtom, results.records);
    set(graphSettingsAtom, iridium.graphSettings);
    await set(setModelAtom, {
      name: metadata.name,
      content: code,
      variableSettingss: iridium.variableSettings,
    });
    set(activeModelFileAtom, id);
  },
);

const _createAndOpenNewFileAtom = atom(null, async (get, set) => {
  const [id, data] = await newModel();
  await set(_updateGlobalsFromModelDataAtom, [id, data]);
  if (get(currentLeftPanelAtom) === null) {
    set(currentLeftPanelAtom, "Time Course");
  }
});

const _openFileAtom = atom(null, async (get, set, id: ModelId) => {
  const data = await openModel(id);
  await set(_updateGlobalsFromModelDataAtom, [id, data]);
  if (get(currentLeftPanelAtom) === null) {
    set(currentLeftPanelAtom, "Time Course");
  }
});

// used for debounce
const _openingFileRefAtom = atom({ current: false });

/**
 * Hook that exposes functions to interact with the file system.
 * These will handle the complete interaction, including reporting any
 * errors to the user.
 */
export const useFileSystemActions = () => {
  const { toast } = useToast();
  const createAndOpenNewFile = useSetAtom(_createAndOpenNewFileAtom);
  const openFile = useSetAtom(_openFileAtom);
  const openingFileRef = useAtomValue(_openingFileRefAtom);

  /**
   * @returns true if it succeeds
   */
  const createAndOpenNewFileWrapper = async (): Promise<boolean> => {
    if (openingFileRef.current) return false;
    openingFileRef.current = true;

    try {
      await createAndOpenNewFile();
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to create model",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      openingFileRef.current = false;
    }
  };

  /**
   * @returns true if it succeeds
   */
  const openFileWrapper = async (id: ModelId): Promise<boolean> => {
    if (openingFileRef.current) return false;
    openingFileRef.current = true;

    try {
      await openFile(id);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to open model",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      openingFileRef.current = false;
    }
  };

  return {
    createAndOpenNewFile: createAndOpenNewFileWrapper,
    openFile: openFileWrapper,
  };
};
