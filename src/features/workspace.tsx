import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { ScopeProvider } from "jotai-scope";

import defaultModel from "@/assets/models/default.ant?raw";

import { modelAtoms, updateEditorContentAtom } from "@/globals/workspace/model";
import { sliderAtoms } from "@/globals/workspace/slider";
import { settingsAtoms } from "@/globals/workspace/settings";
import { simulationAtoms, updateSimulatorAtom } from "@/globals/workspace/simulation";
import { CopasiSimulator } from "./simulation/CopasiSimulator";

const allWorkspaceAtoms = [
  ...modelAtoms,
  ...sliderAtoms,
  ...settingsAtoms,
  ...simulationAtoms,
];

const InitializeAtoms = () => {
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const updateSimulator = useSetAtom(updateSimulatorAtom);
  useEffect(() => {
    updateSimulator(new CopasiSimulator());
    void updateEditorContent({ content: defaultModel, skipDebounce: true });
  }, [updateEditorContent, updateSimulator]);
  return null;
};

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ScopeProvider atoms={allWorkspaceAtoms}>
      <InitializeAtoms />
      {children}
    </ScopeProvider>
  );
};
