import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

import { iridiumDarkTheme, iridiumLightTheme } from "@/features/editor/theme";
import { antimonyMonarchDefinition } from "@/features/editor/monarchDefinition";

self.MonacoEnvironment = {
  getWorker: (_: any, __: string) => {
    return new EditorWorker();
  },
};

monaco.editor.defineTheme("iridiumDark", iridiumDarkTheme);
monaco.editor.defineTheme("iridiumLight", iridiumLightTheme);

monaco.languages.register({ id: "antimony" });
monaco.languages.setMonarchTokensProvider(
  "antimony",
  antimonyMonarchDefinition,
);

monaco.languages.setLanguageConfiguration("antimony", {
  brackets: [["(", ")"]],
});
