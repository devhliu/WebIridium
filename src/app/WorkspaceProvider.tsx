import { useEffect } from "react";
import { Provider, useSetAtom } from "jotai";

import defaultModel from "@/assets/default.ant?raw";

import { requestSavedData, type SavedDataV1 } from "@/features/saving";

import { setModelAtom } from "@/globals/model";
import {
  DEFAULT_SYSTEM_PROMPT,
  systemPromptAtom,
  updateAllChatHistoryAtom,
} from "@/globals/chat";
import { apiKeyAtom } from "@/globals/chat";
import { activeModelFileAtom } from "@/globals/files";
import type { ModelId } from "@/features/savedData";

const Initialize = ({
  didInitialLoadRef,
}: {
  didInitialLoadRef: React.RefObject<boolean>;
}) => {
  const setModel = useSetAtom(setModelAtom);

  const updateAllChatHistory = useSetAtom(updateAllChatHistoryAtom);
  const setApiKey = useSetAtom(apiKeyAtom);
  const setChatPrompt = useSetAtom(systemPromptAtom);

  const setActiveModelFile = useSetAtom(activeModelFileAtom);

  useEffect(() => {
    if (!didInitialLoadRef.current) {
      didInitialLoadRef.current = true;

      const loadWithInitial = async () => {
        // temporary stub for tests until we remove this component and
        // replace with something better
        if (process.env.VITEST) {
          setActiveModelFile("stub" as ModelId);
          await setModel({
            name: "Starter Model",
            content: defaultModel,
            resetCurrentResult: false,
          });
          return;
        }

        let savedData: SavedDataV1 | null = null;
        try {
          savedData = await requestSavedData();
        } catch (err) {
          console.error(err);
        }

        if (savedData) {
          updateAllChatHistory(savedData.workspace.chatHistory ?? []);
          setApiKey(savedData.workspace.apiKey ?? null);
          setChatPrompt(
            savedData.workspace.chatSystemPrompt ?? DEFAULT_SYSTEM_PROMPT,
          );
        }
      };

      void loadWithInitial();
    }
  }, [
    didInitialLoadRef,
    setModel,
    updateAllChatHistory,
    setApiKey,
    setChatPrompt,
  ]);

  return null;
};

const WorkspaceProvider = ({
  didInitialLoadRef,
  children,
}: {
  didInitialLoadRef: React.RefObject<boolean>;
  children: React.ReactNode;
}) => {
  return (
    <Provider>
      <Initialize didInitialLoadRef={didInitialLoadRef} />
      {children}
    </Provider>
  );
};

export default WorkspaceProvider;
