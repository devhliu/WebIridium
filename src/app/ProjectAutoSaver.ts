import { useCallback, useEffect, useRef } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import {
  savePartialProjectAtom,
  saveFullProjectAtom,
  savedCodeAtom,
  savedMetadataAtom,
  savedResultsAtom,
  savedIridiumAtom,
} from "@/globals/saving";
import { hasActiveProjectAtom } from "@/globals/project";
import type {
  IridiumData,
  Metadata,
  ResultsData,
} from "@/features/projectData";

const SAVE_DEBOUNCE = 1_000;

const useAutoSave = <T>(saver: (data: T) => Promise<void>, data: T) => {
  const hasActiveProject = useAtomValue(hasActiveProjectAtom);

  // Skip saving on open since it is redundant.
  // This also makes sure that if a previous project's autosave runs (in the case the user
  // opens one before the setTimeout is fired) it does not go through.
  const canSaveRef = useRef(false);
  useEffect(() => {
    if (hasActiveProject) {
      canSaveRef.current = false;
      const id = setTimeout(() => {
        canSaveRef.current = true;
      }, SAVE_DEBOUNCE);

      return () => clearTimeout(id);
    }
  }, [hasActiveProject]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (canSaveRef.current) {
        void saver(data);
      }
    }, SAVE_DEBOUNCE);
    return () => clearTimeout(id);
  }, [data, saver]);
};

const ProjectAutoSaver = () => {
  const savePartial = useSetAtom(savePartialProjectAtom);
  const saveFull = useSetAtom(saveFullProjectAtom);

  const savedMetadata = useAtomValue(savedMetadataAtom);
  const savedCode = useAtomValue(savedCodeAtom);
  const savedResults = useAtomValue(savedResultsAtom);
  const savedIridium = useAtomValue(savedIridiumAtom);

  useEffect(() => {
    const handleUnload = () => {
      void saveFull();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [saveFull]);

  const saveMetadata = useCallback(
    async (data: Metadata) => await savePartial({ metadata: data }),
    [savePartial],
  );
  const saveIridium = useCallback(
    async (data: IridiumData) => await savePartial({ iridium: data }),
    [savePartial],
  );
  const saveResults = useCallback(
    async (data: ResultsData) => await savePartial({ results: data }),
    [savePartial],
  );
  const saveCode = useCallback(
    async (data: string) => await savePartial({ code: data }),
    [savePartial],
  );

  useAutoSave(saveMetadata, savedMetadata);
  useAutoSave(saveIridium, savedIridium);
  useAutoSave(saveResults, savedResults);
  useAutoSave(saveCode, savedCode);

  return null;
};

export default ProjectAutoSaver;
