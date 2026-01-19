import { useRef } from "react";
import { atom, useSetAtom, useAtomValue, type Atom } from "jotai";
import { loadable } from "jotai/utils";

import {
  migrateMetadata,
  type Metadata,
  type ProjectData,
  type ProjectId,
} from "@/features/projectData";
import {
  closeCurrentProject,
  deleteProject,
  listProjects,
  newProject,
  openProject,
} from "@/features/fileSystem";
import { convertSbmlToAntimony } from "@/features/antimony";

import { useToast } from "@/components/Toast";
import { errorToDisplayString } from "@/features/formatUtils";

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
import { saveFullProjectAtom } from "./saving";

// Increments every time a change is made to the file system
// Other atoms should `get` this if they want to re-evaluate when the file system changes.
export const fileSystemChangeIdAtom = atom(0);

export const activeProjectFileAtom = atom<ProjectId | null>(null);
export const hasActiveProjectAtom = atom(
  (get) => get(activeProjectFileAtom) !== null,
);
export const metadataAtom = atom<Metadata | null>(null);

const _projectListAtom: Atom<Promise<Map<ProjectId, Metadata>>> = atom(
  async (get) => {
    // do this to update the atom on any file system changes
    get(fileSystemChangeIdAtom);

    const projects = await listProjects();
    const migratedProjects: Map<ProjectId, Metadata> = new Map();

    const entries = Array.from(projects.entries());
    entries.sort((a, b) => b[1].updated - a[1].updated);

    for (const [id, metadata] of entries) {
      migratedProjects.set(id, migrateMetadata(metadata));
    }

    return migratedProjects;
  },
);
export const projectListAtom = loadable(_projectListAtom);

const _updateGlobalsFromProjectDataAtom = atom(
  null,
  async (
    _get,
    set,
    [id, { metadata, iridium, code, results }]: [ProjectId, ProjectData],
  ) => {
    await set(setModelAtom, {
      name: metadata.name,
      content: code,
      variableSettingss: iridium.variableSettings,
    });
    set(updateAllHistoryAtom, results.records);
    set(graphSettingsAtom, iridium.graphSettings);
    set(metadataAtom, metadata);
    set(activeProjectFileAtom, id);
  },
);

const _createNewProjectAtom = atom(
  null,
  async (get, set, params: [name: string, code: string] | undefined) => {
    const [name, code] = params ?? [];
    const [id, data] = await newProject(name, code);

    await set(_updateGlobalsFromProjectDataAtom, [id, data]);

    if (get(currentLeftPanelAtom) === null) {
      set(currentLeftPanelAtom, "Time Course");
    }

    set(fileSystemChangeIdAtom, (prev) => prev + 1);
  },
);

const _openProjectAtom = atom(null, async (get, set, id: ProjectId) => {
  const data = await openProject(id);

  await set(_updateGlobalsFromProjectDataAtom, [id, data]);

  if (get(currentLeftPanelAtom) === null) {
    set(currentLeftPanelAtom, "Time Course");
  }
});

const _closeCurrentProjectAtom = atom(null, async (_get, set) => {
  await set(saveFullProjectAtom);
  await closeCurrentProject();
  set(activeProjectFileAtom, null);
  set(metadataAtom, null);
  set(currentLeftPanelAtom, null);
  set(currentRightPanelAtom, null);
  set(currentVeryRightPanelAtom, null);
  set(currentBottomPanelAtom, null);
  set(simulationResultAtom, null);
});

const _deleteProjectAtom = atom(null, async (_get, set, id: ProjectId) => {
  await deleteProject(id);
  set(fileSystemChangeIdAtom, (old) => old + 1);
});

// used for debounce
const _inTransactionRefAtom = atom({ current: false });

/**
 * Hook that exposes functions to interact with the file system.
 * These will handle the complete interaction, including reporting any
 * errors to the user.
 */
export const useProjectActions = () => {
  const { toast } = useToast();
  const createNewProject = useSetAtom(_createNewProjectAtom);
  const openProject = useSetAtom(_openProjectAtom);
  const closeCurrentProject = useSetAtom(_closeCurrentProjectAtom);
  const deleteProject = useSetAtom(_deleteProjectAtom);
  const inTransactionRef = useAtomValue(_inTransactionRefAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  /** @returns true if it succeeds */
  const createNewProjectWrapper = async (
    params?: [name: string, code: string],
  ): Promise<boolean> => {
    if (inTransactionRef.current) return false;
    inTransactionRef.current = true;

    try {
      await createNewProject(params);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to create project",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      inTransactionRef.current = false;
    }
  };

  /** returns true on success */
  const createNewProjectFromBiomodel = async (
    info: BiomodelInfo,
  ): Promise<boolean> => {
    if (inTransactionRef.current) return false;
    inTransactionRef.current = true;

    try {
      const sbml = await loadBiomodelSbml(info);
      const antimony = await convertSbmlToAntimony(sbml);
      await createNewProject([info.name, antimony]);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to create project",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      inTransactionRef.current = false;
    }
  };

  const closeCurrentProjectWrapper = async () => {
    await closeCurrentProject();
  };

  /** @returns true if it succeeds */
  const openProjectWrapper = async (id: ProjectId): Promise<boolean> => {
    if (inTransactionRef.current) return false;
    inTransactionRef.current = true;

    try {
      await openProject(id);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to open project",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      inTransactionRef.current = false;
    }
  };

  /** @returns true if it succeeds */
  const deleteProjectWrapper = async (id: ProjectId): Promise<boolean> => {
    if (inTransactionRef.current) return false;
    inTransactionRef.current = true;

    try {
      await deleteProject(id);
      return true;
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete project",
        description: errorToDisplayString(err),
      });
      return false;
    } finally {
      inTransactionRef.current = false;
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

      void createNewProjectWrapper([nameWithoutExtension, content]);
    };
  };

  const promptProjectFromFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  /**
   * Render this somewhere so that promptProjectFromFile works.
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
    createNewProject: createNewProjectWrapper,
    createNewProjectFromBiomodel: createNewProjectFromBiomodel,
    openProject: openProjectWrapper,
    deleteProject: deleteProjectWrapper,
    promptProjectFromFile: promptProjectFromFile,
    closeCurrentProject: closeCurrentProjectWrapper,
    FileInput: FileInput,
  };
};
