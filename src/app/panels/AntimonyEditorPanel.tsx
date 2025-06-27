import { useEffect, useState } from "react";

import styles from "./AntimonyEditorPanel.module.css";
import ToastTest from "@/app/ToastTest";
import { useEditorContent } from "@/features/editorContent";

import defaultModel from "/models/default.ant?raw";
import chickenModel from "/models/chicken.ant?raw";
import bigYAxisModel from "/models/bigyaxis.ant?raw";

const models: Record<string, string> = {
  default: defaultModel,
  chicken: chickenModel,
  bigYAxis: bigYAxisModel,
};

export const AntimonyEditorPanel = () => {
  const [text, setText] = useState(models.default);
  const { editorContent, setEditorContent } = useEditorContent();

  useEffect(() => {
    const handleContentChange = () => {
      setText(editorContent!.value);
    };

    editorContent?.addEventListener("change", handleContentChange);
    return () => {
      editorContent?.removeEventListener("change", handleContentChange);
    };
  }, [editorContent]);

  useEffect(() => {
    void setEditorContent(text);
  }, [text, setEditorContent]);

  return (
    <div className={styles.antimonyEditorPanel}>
      <ToastTest />
      <select onChange={(e) => setText(models[e.target.value])}>
        <option value="default">Default</option>
        <option value="chicken">Chicken</option>
        <option value="bigYAxis">Big Y-Axis</option>
      </select>
      <textarea
        name="anitmony-test"
        value={text}
        style={{ width: "100%", height: "500px" }}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
};

export default AntimonyEditorPanel;
