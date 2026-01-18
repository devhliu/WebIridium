import { useRef } from "react";
import { atom, useSetAtom, useAtomValue, type Atom } from "jotai";
import { loadable } from "jotai/utils";

import {
  migrateMetadata,
  type Metadata,
  type ModelData,
  type ModelId,
} from "@/features/savedData";
import {
  closeCurrentModel,
  listModels,
  newModel,
  openModel,
} from "@/features/fileSystem";
import { convertSbmlToAntimony } from "@/features/antimony";

import { useToast } from "@/components/Toast";
import errorToDisplayString from "@/utils/errorToDisplayString";

import { setModelAtom } from "./model";
import { updateAllHistoryAtom } from "./history";
import { graphSettingsAtom } from "./settings";
import {
  currentBottomPanelAtom,
  currentLeftPanelAtom,
  currentRightPanelAtom,
  currentVeryRightPanelAtom,
} from "./layout";
import { loadBiomodelSbml, type BiomodelInfo } from "@/features/biomodels";
import { simulationResultAtom } from "./simulation";

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
    const migratedModels: Map<ModelId, Metadata> = new Map();

    const entries = Array.from(models.entries());
    entries.sort((a, b) => b[1].updated - a[1].updated);

    for (const [id, metadata] of entries) {
      migratedModels.set(id, migrateMetadata(metadata));
    }

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
    await set(setModelAtom, {
      name: metadata.name,
      content: code,
      variableSettingss: iridium.variableSettings,
    });
    set(updateAllHistoryAtom, results.records);
    set(graphSettingsAtom, iridium.graphSettings);
    set(activeModelFileAtom, id);
  },
);

const _createNewModelAtom = atom(
  null,
  async (get, set, params: [name: string, code: string] | undefined) => {
    const [name, code] = params ?? [];
    const [id, data] = await newModel(name, code);

    await set(_updateGlobalsFromModelDataAtom, [id, data]);

    if (get(currentLeftPanelAtom) === null) {
      set(currentLeftPanelAtom, "Time Course");
    }

    set(_changeIdAtom, (prev) => prev + 1);
  },
);

const _openModelAtom = atom(null, async (get, set, id: ModelId) => {
  const data = await openModel(id);

  await set(_updateGlobalsFromModelDataAtom, [id, data]);

  if (get(currentLeftPanelAtom) === null) {
    set(currentLeftPanelAtom, "Time Course");
  }
});

const _closeCurrentModelAtom = atom(null, async (_get, set) => {
  await closeCurrentModel();
  set(activeModelFileAtom, null);
  set(currentLeftPanelAtom, null);
  set(currentRightPanelAtom, null);
  set(currentVeryRightPanelAtom, null);
  set(currentBottomPanelAtom, null);
  set(simulationResultAtom, null);
});

// used for debounce
const _openingModelRefAtom = atom({ current: false });

/**
 * Hook that exposes functions to interact with the file system.
 * These will handle the complete interaction, including reporting any
 * errors to the user.
 */
export const useFileSystemActions = () => {
  const { toast } = useToast();
  const createNewModel = useSetAtom(_createNewModelAtom);
  const openModel = useSetAtom(_openModelAtom);
  const closeCurrentModel = useSetAtom(_closeCurrentModelAtom);
  const openingModelRef = useAtomValue(_openingModelRefAtom);
  const inputRef = useRef<HTMLInputElement>(null);

  /** @returns true if it succeeds */
  const createNewModelWrapper = async (
    params?: [name: string, code: string],
  ): Promise<boolean> => {
    if (openingModelRef.current) return false;
    openingModelRef.current = true;

    try {
      await createNewModel(params);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to create model",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      openingModelRef.current = false;
    }
  };

  /** returns true on success */
  const createNewModelFromBiomodel = async (
    info: BiomodelInfo,
  ): Promise<boolean> => {
    if (openingModelRef.current) return false;
    openingModelRef.current = true;

    try {
      const sbml = await loadBiomodelSbml(info);
      const antimony = await convertSbmlToAntimony(sbml);
      await createNewModel([info.name, antimony]);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to create model",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      openingModelRef.current = false;
    }
  };

  const closeCurrentModelWrapper = async () => {
    await closeCurrentModel();
  };

  /** @returns true if it succeeds */
  const openModelWrapper = async (id: ModelId): Promise<boolean> => {
    if (openingModelRef.current) return false;
    openingModelRef.current = true;

    try {
      await openModel(id);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to open model",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      openingModelRef.current = false;
    }
  };

  const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length !== 1) {
      toast({
        type: "error",
        title: "File open failed",
        description: "A single file must be selected",
      });
      return;
    }

    const file = files[0];
    const nameWithoutExtension = file.name.split(".")[0];
    const isSbml =
      file.name.toLowerCase().endsWith(".sbml") ||
      file.name.toLowerCase().endsWith(".xml");
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      let content = reader.result as string;
      if (isSbml) {
        try {
          content = await convertSbmlToAntimony(content);
        } catch (e) {
          // silently fail and use the content directly
          console.error(e);
        }
      }
      void createNewModelWrapper([nameWithoutExtension, content]);
    };
  };

  const promptModelFromFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  /**
   * Render this somewhere so that promptModelFromFile works.
   */
  const FileInput = () => {
    return (
      <input
        style={{ display: "none" }}
        ref={inputRef}
        type="file"
        onChange={handleFileOpen}
        accept=".ant,.txt,.xml,.sbml"
      />
    );
  };

  return {
    createNewModel: createNewModelWrapper,
    createNewModelFromBiomodel: createNewModelFromBiomodel,
    openModel: openModelWrapper,
    promptModelFromFile: promptModelFromFile,
    closeCurrentModel: closeCurrentModelWrapper,
    FileInput: FileInput,
  };
};
