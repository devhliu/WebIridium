import { useAtom, useAtomValue } from "jotai";
import styles from "./SlidersPanel.module.css";
import { variablesAtom } from "@/globals/workspace/model";
import {
  updateVariableSliderValueAtom,
  variableSliderStatesAtom,
  type VariableSliderState,
} from "@/globals/workspace/slider";
import { variableSettingssAtom } from "@/globals/workspace/settings";
import { groupVariables } from "@/features/category";
import VariableSlider from "./VariableSlider";
import { useCallback } from "react";
import { useSetAtom } from "jotai";

const SLIDER_CATEGORY_ORDER = ["Parameters", "Species"];

const SlidersPanel = () => {
  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const [variableSliderStates, setVariableSliderStates] = useAtom(
    variableSliderStatesAtom,
  );

  const filteredVariables = variables.filter((v) => v.type === "settable");
  const groups = groupVariables(filteredVariables, SLIDER_CATEGORY_ORDER);

  const updateVariableSliderValue = useSetAtom(updateVariableSliderValueAtom);

  const handleValueChange = useCallback(
    (variableName: string, newValue: number) => {
      updateVariableSliderValue({ variableName, value: newValue });
    },
    [updateVariableSliderValue],
  );

  const handleStateChange = useCallback(
    (variableName: string, newState: VariableSliderState | undefined) => {
      if (newState === undefined) {
        setVariableSliderStates((old) => {
          // this excludes the key `variableName` from rest
          const { [variableName]: _, ...rest } = old;
          return rest;
        });
      } else {
        setVariableSliderStates((old) => ({
          ...old,
          [variableName]: newState,
        }));
      }
    },
    [setVariableSliderStates],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.sliders}>
        {groups.map(([group, vars]) => (
          <div key={group} className={styles.group}>
            <h3 className={styles.groupTitle}>{group}</h3>
            {vars.map((v) => (
              <VariableSlider
                key={v.name}
                variable={v}
                settings={variableSettingss[v.name]}
                sliderState={variableSliderStates[v.name]}
                onValueChange={handleValueChange}
                onStateChange={handleStateChange}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidersPanel;
