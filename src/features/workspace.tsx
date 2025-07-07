import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { ScopeProvider } from "jotai-scope";

import defaultModel from "@/assets/models/default.ant?raw";

import {
  modelAtoms,
  updateEditorContentAtom,
} from "@/globals/workspace/model";
import { sliderAtoms } from "@/globals/workspace/slider";
import { settingsAtoms } from "@/globals/workspace/settings";
import { simulationAtoms } from "@/globals/workspace/simulation";

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
