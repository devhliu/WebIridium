import { atom } from "jotai";
import { commitSavedData } from "@/features/saving";
import { apiKeyAtom, systemPromptAtom } from "./chat";
import { chatHistoryAtom } from "./chat";

export const saveAtom = atom(null, async (get, _set): Promise<void> => {
  await commitSavedData({
    workspace: {
      chatHistory: get(chatHistoryAtom),
      chatSystemPrompt: get(systemPromptAtom),
      apiKey: get(apiKeyAtom),
    },
  });
});
