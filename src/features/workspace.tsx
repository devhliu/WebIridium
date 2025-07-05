import { createContext, useContext, useEffect, useMemo } from "react";
import { ScopeProvider } from "jotai-scope";

import defaultModel from "@/assets/models/default.ant?raw";

import { type Simulator } from "@/features/simulation/Simulator";
import { allWorkspaceAtoms } from "@/stores/workspace";
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";
import { useEditorContent } from "./useEditorContent";

export interface Workspace {
  simulator: Simulator;
}

const WorkspaceContext = createContext<Workspace | null>(null);

const InitializeEditorContent = () => {
  const { updateEditorContent } = useEditorContent();
  useEffect(() => {
    void updateEditorContent(defaultModel, { skipDebounce: true });
    // eslint-disable-next-line
  }, []);
  return null;
};

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const workspace = useMemo(() => {
    return Object.freeze({
      simulator: new CopasiSimulator(),
    });
  }, []);

  return (
    <ScopeProvider atoms={allWorkspaceAtoms}>
      <WorkspaceContext value={workspace}>
        <InitializeEditorContent />
        {children}
      </WorkspaceContext>
    </ScopeProvider>
  );
};

// eslint-disable-next-line
export const useSimulator = () => {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) {
    throw new Error("must be inside a workspace!");
  }

  return workspace.simulator;
};
