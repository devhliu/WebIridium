import { useAtomValue, useSetAtom } from "jotai";

import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";

export const EditorPanel = () => {
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);

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
