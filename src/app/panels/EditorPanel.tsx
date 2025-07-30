import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import styles from "./EditorPanel.module.css";
import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";
import { themeAtom } from "@/globals/theme";
import type { Theme } from "@/features/theme";

const EditorPanel = () => {
  const theme = useAtomValue(themeAtom);
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const updateTheme = (themeName: Theme) => {
    if (themeName === "light") {
      monaco.editor.setTheme("iridiumLight");
    } else {
      monaco.editor.setTheme("iridiumDark");
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container && !editorRef.current) {
      const editor = monaco.editor.create(container, {
        value: editorContent,
        language: "antimony",
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        matchBrackets: "always",
        showFoldingControls: "always",
        minimap: {
          enabled: false,
        },
      });

      const event = editor.onDidChangeModelContent(() => {
        void updateEditorContent({ content: editor.getValue() });
      });

      updateTheme(theme);

      editorRef.current = editor;
      return () => {
        event.dispose();
        editor.dispose();
        editorRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, updateEditorContent]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      if (editor.getValue() !== editorContent) {
        editor.setValue(editorContent);
      }
    }
  }, [editorContent]);

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  return (
    <div className={styles.panel}>
      <div className={styles.container} ref={containerRef} />
    </div>
  );
};

export default EditorPanel;
