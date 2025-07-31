import { useAtomValue, useSetAtom } from "jotai";

import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";

import {
  editorActionsDispatcherAtom,
  type EditorActionsDispatcher,
} from "@/globals/workspace/editorActions";
import { useEffect } from "react";

export const EditorPanel = () => {
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);

  const setEditorActionsDispatcher = useSetAtom(editorActionsDispatcherAtom);

  useEffect(() => {
    const dispatcher: EditorActionsDispatcher = {
      addPresetsAsComment: () => undefined,
    };

    setEditorActionsDispatcher(dispatcher);
  }, [setEditorActionsDispatcher]);

  return (
    <div>
      <textarea
        name="anitmony-test"
        value={editorContent}
        style={{ width: "100%", height: "500px" }}
        onChange={(e) => void updateEditorContent({ content: e.target.value })}
      />
    </div>
  );
};

export default EditorPanel;
