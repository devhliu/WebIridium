import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
  getWorker: (_: any, __: string) => {
    return new EditorWorker();
  },
};
