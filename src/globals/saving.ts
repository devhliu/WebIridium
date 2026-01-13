import { atom } from "jotai";
import { commitSavedData } from "@/features/saving";
import { editorFontSizeAtom, themeOptionAtom } from "./appearance";
import { graphSettingsAtom, nameAtom, variableSettingssAtom } from "./settings";
import { editorContentAtom } from "./model";
import { historyAtom } from "./history";
import { apiKeyAtom, systemPromptAtom } from "./chat";
import { chatHistoryAtom } from "./chat";

export const saveAtom = atom(null, async (get, _set): Promise<void> => {
  await commitSavedData({
    theme: get(themeOptionAtom),
    editorFontSize: get(editorFontSizeAtom),
    workspace: {
      name: get(nameAtom),
      graphSettings: get(graphSettingsAtom),
      variableSettingss: get(variableSettingssAtom),
      content: get(editorContentAtom),
      history: get(historyAtom),
      chatHistory: get(chatHistoryAtom),
      chatSystemPrompt: get(systemPromptAtom),
      apiKey: get(apiKeyAtom),
    },
  });
});
