import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { ScopeProvider } from "jotai-scope";

import defaultModel from "@/assets/models/default.ant?raw";

import {
  modelAtoms,
  updateEditorContentAtom,
} from "@/stores/workspace/model.ts";
import { sliderAtoms } from "@/stores/workspace/slider.ts";
import { settingsAtoms } from "@/stores/workspace/settings.ts";
import { simulationAtoms } from "@/stores/workspace/simulation.ts";

const allWorkspaceAtoms = [
  ...modelAtoms,
  ...sliderAtoms,
  ...settingsAtoms,
  ...simulationAtoms,
];

const InitializeEditorContent = () => {
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  useEffect(() => {
    void updateEditorContent({ content: defaultModel, skipDebounce: true });
    // eslint-disable-next-line
  }, []);
  return null;
};

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ScopeProvider atoms={allWorkspaceAtoms}>
      <InitializeEditorContent />
      {children}
    </ScopeProvider>
  );
};
