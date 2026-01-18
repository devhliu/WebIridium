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
import { activeProjectFileAtom } from "@/globals/project";
import type { ProjectId } from "@/features/projectData";

const Initialize = ({
  didInitialLoadRef,
  shouldStubActiveFile,
}: {
  didInitialLoadRef: React.RefObject<boolean>;
  shouldStubActiveFile?: boolean;
}) => {
  const setModel = useSetAtom(setModelAtom);

  const updateAllChatHistory = useSetAtom(updateAllChatHistoryAtom);
  const setApiKey = useSetAtom(apiKeyAtom);
  const setChatPrompt = useSetAtom(systemPromptAtom);

  const setActiveProjectFile = useSetAtom(activeProjectFileAtom);

  useEffect(() => {
    if (!didInitialLoadRef.current) {
      didInitialLoadRef.current = true;

      const loadWithInitial = async () => {
        // temporary stub for tests until we remove this component and
        // replace with something better
        if (shouldStubActiveFile) {
          setActiveProjectFile("stub" as ProjectId);
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
    setActiveProjectFile,
    updateAllChatHistory,
    setApiKey,
    setChatPrompt,
    shouldStubActiveFile,
  ]);

  return null;
};

const WorkspaceProvider = ({
  didInitialLoadRef,
  shouldStubActiveFile,
  children,
}: {
  didInitialLoadRef: React.RefObject<boolean>;
  shouldStubActiveFile?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Provider>
      <Initialize
        didInitialLoadRef={didInitialLoadRef}
        shouldStubActiveFile={shouldStubActiveFile}
      />
      {children}
    </Provider>
  );
};

export default WorkspaceProvider;
