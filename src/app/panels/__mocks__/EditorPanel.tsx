import { useAtomValue, useSetAtom } from "jotai";

import ToastTest from "@/app/ToastTest";
import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";

import defaultModel from "@/assets/models/default.ant?raw";
import chickenModel from "@/assets/models/chicken.ant?raw";
import bigYAxisModel from "@/assets/models/bigyaxis.ant?raw";
import bigModel from "@/assets/models/big.ant?raw";
import phosphorylationModel from "@/assets/models/phosphorylation.ant?raw";
import glycolysisModel from "@/assets/models/glycolysis.ant?raw";
import insulinModel from "@/assets/models/insulin.ant?raw";

const models: Record<string, string> = {
  default: defaultModel,
  chicken: chickenModel,
  bigYAxis: bigYAxisModel,
  big: bigModel,
  phosphorylation: phosphorylationModel,
  glycolysis: glycolysisModel,
  insulin: insulinModel,
};

export const EditorPanel = () => {
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);

  return (
    <div>
      <ToastTest />
      <select
        onChange={(e) =>
          void updateEditorContent({ content: models[e.target.value] })
        }
      >
        <option value="default">Default</option>
        <option value="chicken">Chicken</option>
        <option value="bigYAxis">Big Y-Axis</option>
        <option value="big">Big (Random)</option>
        <option value="phosphorylation">Phosphorylation</option>
        <option value="glycolysis">Glycolysis</option>
        <option value="insulin">Insulin</option>
      </select>
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
