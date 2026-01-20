import { atom } from "jotai";
import { commitSavedData } from "@/features/saving";
import { apiKeyAtom, systemPromptAtom } from "./chat";
import { chatHistoryAtom } from "./chat";
import {
  fileSystemChangeIdAtom,
  hasActiveProjectAtom,
  metadataAtom,
} from "./project";
import { editorContentAtom, variableSettingssAtom } from "./model";
import type {
  IridiumData,
  ProjectData,
  ResultsData,
} from "@/features/projectData";
import {
  graphSettingsAtom,
  parameterScanOptionsAtom,
  timeCourseParametersAtom,
} from "./settings";
import { historyAtom } from "./history";
import { saveProject } from "@/features/fileSystem";

export const saveAtom = atom(null, async (get, _set): Promise<void> => {
  await commitSavedData({
    workspace: {
      chatHistory: get(chatHistoryAtom),
      chatSystemPrompt: get(systemPromptAtom),
      apiKey: get(apiKeyAtom),
    },
  });
});

const _isSavingAtom = atom(0);
export const isSavingAtom = atom((get) => get(_isSavingAtom) > 0);

export const savedMetadataAtom = atom((get) => get(metadataAtom));

export const savedCodeAtom = atom((get) => get(editorContentAtom));

export const savedIridiumAtom = atom(
  (get) =>
    ({
      versionTag: 2,
      graphSettings: get(graphSettingsAtom),
      variableSettings: get(variableSettingssAtom),
      timeCourseParameters: get(timeCourseParametersAtom),
      parameterScanOptions: get(parameterScanOptionsAtom),
    }) satisfies IridiumData,
);

export const savedResultsAtom = atom(
  (get) => ({ versionTag: 1, records: get(historyAtom) }) satisfies ResultsData,
);

export const savePartialProjectAtom = atom(
  null,
  async (get, set, data: Partial<ProjectData>) => {
    if (!get(hasActiveProjectAtom)) return;

    set(_isSavingAtom, get(_isSavingAtom) + 1);
    try {
      // make sure to always update the Updated timestamp
      let savingData = data;
      if (data.metadata === undefined) {
        savingData = {
          ...savingData,
          metadata: {
            ...get(savedMetadataAtom),
            updated: Date.now(),
          },
        };
      } else {
        savingData = {
          ...savingData,
          metadata: {
            ...data.metadata,
            updated: Date.now(),
          },
        };
      }

      await saveProject(savingData);
    } finally {
      set(fileSystemChangeIdAtom, (old) => old + 1);
      // add a little delay so it doesn't go too fast
      setTimeout(() => {
        set(_isSavingAtom, get(_isSavingAtom) - 1);
      }, 500);
    }
  },
);

export const saveFullProjectAtom = atom(null, async (get, set) => {
  if (!get(hasActiveProjectAtom)) return;

  const metadata = get(savedMetadataAtom);
  const iridium = get(savedIridiumAtom);
  const code = get(savedCodeAtom);
  const results = get(savedResultsAtom);

  if (metadata && iridium && code !== null && results) {
    await set(savePartialProjectAtom, { metadata, iridium, code, results });
  }
});
