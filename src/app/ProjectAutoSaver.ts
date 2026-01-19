import { useEffect, useRef } from "react";
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

const AUTO_SAVE_INTERVAL = 120_000;
const SAVE_DEBOUNCE = 500;

const useAutoSave = <T>(
  saver: (data: NonNullable<T>) => Promise<void>,
  data: T,
) => {
  const hasActiveProject = useAtomValue(hasActiveProjectAtom);
  //
  // skip saving on open
  const canSaveRef = useRef(false);
  useEffect(() => {
    if (hasActiveProject) {
      canSaveRef.current = false;
      const id = setTimeout(() => {
        canSaveRef.current = true;
      }, 500);

      return () => clearTimeout(id);
    }
  }, [hasActiveProject]);

  useEffect(() => {
    if (!canSaveRef.current) return;

    if (data !== undefined && data !== null) {
      const id = setTimeout(() => {
        void saver(data);
      }, SAVE_DEBOUNCE);
      return () => clearTimeout(id);
    }
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
    const id = setInterval(() => {
      void saveFull();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(id);
  }, [saveFull]);

  useEffect(() => {
    const handleUnload = () => {
      void saveFull();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [saveFull]);

  useAutoSave(async (data) => {
    await savePartial({ metadata: data });
  }, savedMetadata);

  useAutoSave(async (data) => {
    await savePartial({ code: data });
  }, savedCode);

  useAutoSave(async (data) => {
    await savePartial({ iridium: data });
  }, savedIridium);

  useAutoSave(async (data) => {
    await savePartial({ results: data });
  }, savedResults);

  return null;
};

export default ProjectAutoSaver;
