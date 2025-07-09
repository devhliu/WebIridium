// TODO: unit test

import clsx from "clsx";
import { useState } from "react";
import { useSetAtom } from "jotai";

import styles from "./ExamplesPanel.module.css";

import {
  exampleFormattedNames,
  examplePresets,
  examples,
} from "@/features/examples";

import PlayIcon from "@/assets/icons/PlayIcon.svg?react";

import PanelTitle from "./PanelTitle";
import Button from "@/components/Button";
import PulseLoader from "@/components/PulseLoader";

import { updateEditorContentAtom } from "@/globals/workspace/model";
import { useToast } from "@/components/Toast";
import { simulateTimeCourseAtom } from "@/globals/workspace/simulation";
import {
  nameAtom,
  timeCourseParametersAtom,
  variableSettingssAtom,
} from "@/globals/workspace/settings";

const ExampleButton = ({
  name,
  running,
  onRun,
}: {
  name: string;
  running: boolean;
  onRun: () => void;
}) => {
  return (
    <Button
      className={clsx(styles.item, running && styles.running)}
      disabled={running}
      onClick={onRun}
    >
      <span className={styles.itemText}>{exampleFormattedNames[name]}</span>
      <div className={styles.itemIcon} aria-hidden>
        {running ? (
          <PulseLoader size="0.3em" />
        ) : (
          <PlayIcon width="1em" height="1em" />
        )}
      </div>
    </Button>
  );
};

export interface ExamplesPanelProps {
  visible: boolean;
}

const ExamplesPanel = ({ visible }: ExamplesPanelProps) => {
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const simulateTimeCourse = useSetAtom(simulateTimeCourseAtom);
  const setTimeCourseParameters = useSetAtom(timeCourseParametersAtom);
  const setVariableSettingss = useSetAtom(variableSettingssAtom);
  const setWorkspaceName = useSetAtom(nameAtom);

  const { toast } = useToast();
  const [runningExample, setRunningExample] = useState<string | null>(null);

  const handleRun = async (example: string) => {
    setRunningExample(example);
    if (
      !(await updateEditorContent({
        content: examples[example],
        skipDebounce: true,
      }))
    ) {
      toast({
        type: "error",
        title: "Example Failed to Load",
        description: "Something happened while loading the model.",
      });

      setRunningExample(null);
    } else {
      // apply preset
      const preset = examplePresets[example];
      setWorkspaceName(exampleFormattedNames[example]);
      if (preset) {
        setTimeCourseParameters(preset.parameters);
        if (preset.hideVariables) {
          setVariableSettingss((old) => {
            const oldCopy = { ...old };
            for (const variableName of preset.hideVariables!) {
              oldCopy[variableName] = {
                ...oldCopy[variableName],
                visible: false,
              };
            }
            return oldCopy;
          });
        }
      }

      const timeCourseResult = await simulateTimeCourse();
      if (timeCourseResult.type === "success") {
        setRunningExample(null);
      } else if (timeCourseResult.type === "failure") {
        toast({
          type: "error",
          title: "Example Simulation Error",
          description: timeCourseResult.message,
        });
        setRunningExample(null);
      }
    }
  };

  if (!visible) {
    return null;
  } else {
    return (
      <div className={styles.panel}>
        <PanelTitle title="Examples" />

        <div className={styles.list}>
          {Object.keys(examples).map((example) => (
            <ExampleButton
              key={example}
              name={example}
              running={example === runningExample}
              onRun={() => void handleRun(example)}
            />
          ))}
        </div>
      </div>
    );
  }
};

export default ExamplesPanel;
