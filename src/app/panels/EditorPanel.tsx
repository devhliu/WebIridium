import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import styles from "./EditorPanel.module.css";
import {
  editorContentAtom,
  updateEditorContentAtom,
  modelStatusAtom,
} from "@/globals/workspace/model";
import { themeAtom } from "@/globals/theme";
import type { Theme } from "@/features/theme";
import {
  editorActionsDispatcherAtom,
  type EditorActionsDispatcher,
} from "@/globals/workspace/editorActions";
import { addVariablePresetsToModel } from "@/features/antimony";

// used for Monaco model
const OWNER_NAME = "editorPanel";

const MODEL_ERROR_REGEX = /Error in model string, line (\d+):(.+)/;

const EditorPanel = () => {
  const theme = useAtomValue(themeAtom);
  const modelStatus = useAtomValue(modelStatusAtom);
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const setEditorActionsDispatcher = useSetAtom(editorActionsDispatcherAtom);

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
      // monaco instance setup

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

      // dispatcher setup

      const dispatcher: EditorActionsDispatcher = {
        addPresetsAsComment: (name, presets) => {
          const [newContent, { line, column }] = addVariablePresetsToModel(
            editor.getValue(),
            name,
            presets,
          );

          editor.setValue(newContent);
          editor.revealPositionInCenter({
            lineNumber: line + 1,
            column: 1,
          });
          editor.focus();
          editor.setSelection({
            startLineNumber: line + 1,
            endLineNumber: line + 1,
            startColumn: column + 1,
            endColumn: 9999, // select the rest of the line
          });
        },
      };

      setEditorActionsDispatcher(dispatcher);

      return () => {
        event.dispose();
        editor.dispose();
        editorRef.current = null;

        setEditorActionsDispatcher((prev) =>
          prev === dispatcher ? null : prev,
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, updateEditorContent, setEditorActionsDispatcher]);

  // sychronize when editor content changes externally
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      if (editor.getValue() !== editorContent) {
        editor.setValue(editorContent);
      }
    }
  }, [editorContent]);

  // synchronize theme
  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  // synchronize errors
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = [];

    if (modelStatus.type === "error") {
      const match = modelStatus.message.match(MODEL_ERROR_REGEX);
      if (match) {
        const line = Number(match[1]);
        const errorMessage = match[2].trim();

        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: errorMessage,
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 10000, // do the whole line
        });
      }
    }

    monaco.editor.setModelMarkers(model, OWNER_NAME, markers);
  }, [editorRef, modelStatus]);

  return (
    <div className={styles.panel}>
      <div className={styles.container} ref={containerRef} />
    </div>
  );
};

export default EditorPanel;
