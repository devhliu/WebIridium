import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import * as monaco from "monaco-editor";

import { useToast } from "@/components/Toast";

import styles from "./EditorPanel.module.css";
import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";
import { editorFontSizeAtom, themeAtom } from "@/globals/appearance";
import {
  editorActionsDispatcherAtom,
  type EditorActionsDispatcher,
} from "@/globals/workspace/editorActions";
import {
  addVariablePresetToModel,
  createLoadPresetCommandHandler,
  createLoadPresetProvider,
} from "@/features/editor/presetComments";
import ModelSemanticsChecker from "@/features/editor/language-handler/ModelSemanticChecker";
import { loadPresetAndSimulateAtom } from "@/globals/workspace/slider";

const SEMANTIC_CHECKER_DEBOUNCE = 100; // in ms
const ANNOTATION_COLOR = "Red";

const EditorPanel = () => {
  const theme = useAtomValue(themeAtom);
  const fontSize = useAtomValue(editorFontSizeAtom);

  const loadPresetAndSimulate = useSetAtom(loadPresetAndSimulateAtom);
  const setEditorActionsDispatcher = useSetAtom(editorActionsDispatcherAtom);

  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);

  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const semanticCheckerTimerIdRef = useRef<number | null>(null);
  const areAnnotationsEnabledRef = useRef(false);

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
        codeLens: true,
        fontSize,
      });

      const editorChangeEvent = editor.onDidChangeModelContent(() => {
        void updateEditorContent({ content: editor.getValue() });
        queueSemanticCheck();
      });

      if (theme === "Light") {
        monaco.editor.setTheme("iridiumLight");
      } else if (theme === "Monokai") {
        monaco.editor.setTheme("monokai");
      } else {
        monaco.editor.setTheme("iridiumDark");
      }

      const handlePresetLoad = (
        name: string,
        preset: Record<string, number>,
      ) => {
        loadPresetAndSimulate(preset);
        toast({
          type: "success",
          title: `Loaded ${name}`,
          description: Object.entries(preset)
            .map(([k, v]) => `${k}=${v}`)
            .join(", "),
        });
      };

      const loadPresetCommandId = editor.addCommand(
        0,
        createLoadPresetCommandHandler(editor.getModel()!, handlePresetLoad),
      );

      const loadPresetProvider = monaco.languages.registerCodeLensProvider(
        "antimony",
        createLoadPresetProvider(loadPresetCommandId!),
      );

      editorRef.current = editor;

      // dispatcher setup

      const dispatcher: EditorActionsDispatcher = {
        addPresetAsComment: (name, presets) => {
          const [newContent, { line, column }] = addVariablePresetToModel(
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
        editorChangeEvent.dispose();
        editor.dispose();
        loadPresetProvider.dispose();
        editorRef.current = null;

        setEditorActionsDispatcher((prev) =>
          prev === dispatcher ? null : prev,
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerRef,
    updateEditorContent,
    setEditorActionsDispatcher,
    loadPresetAndSimulate,
    theme,
    fontSize,
  ]);

  // sychronize when editor content changes externally
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      if (editor.getValue() !== editorContent) {
        editor.setValue(editorContent);
      }
    }
  }, [editorContent]);

  const queueSemanticCheck = () => {
    const editor = editorRef.current;
    if (!editor) return;

    if (semanticCheckerTimerIdRef.current) {
      clearTimeout(semanticCheckerTimerIdRef.current);
    }

    semanticCheckerTimerIdRef.current = window.setTimeout(() => {
      semanticCheckerTimerIdRef.current = null;
      ModelSemanticsChecker(
        editor,
        areAnnotationsEnabledRef.current,
        true,
        ANNOTATION_COLOR,
        decorationsRef.current,
      );
    }, SEMANTIC_CHECKER_DEBOUNCE);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.container} ref={containerRef} />
    </div>
  );
};

export default EditorPanel;
