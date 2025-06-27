import { createContext, useContext, useMemo } from "react";
import { ScopeProvider } from "jotai-scope";

import { type Simulator } from "@/features/simulation/Simulator";
import { allWorkspaceAtoms } from "@/stores/workspace";
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";

export interface Workspace {
  simulator: Simulator;
}

const WorkspaceContext = createContext<Workspace | null>(null);

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
      <WorkspaceContext value={workspace}>{children}</WorkspaceContext>
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
