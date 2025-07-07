import { useAtom, useAtomValue } from "jotai";
import styles from "./SlidersPanel.module.css";
import { variablesAtom } from "@/stores/workspace/model";
import {
  variableSliderStatesAtom,
  type VariableSliderState,
} from "@/stores/workspace/slider";
import { variableSettingssAtom } from "@/stores/workspace/settings";
import { groupVariables } from "@/features/category";
import VariableSlider from "./VariableSlider";
import { useCallback } from "react";

const SLIDER_CATEGORY_ORDER = ["Parameters", "Species"];

const SlidersPanel = () => {
  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const [variableSliderStates, setVariableSliderStates] = useAtom(
    variableSliderStatesAtom,
  );

  const filteredVariables = variables.filter((v) => v.type === "settable");
  const groups = groupVariables(filteredVariables, SLIDER_CATEGORY_ORDER);

  const handleChange = useCallback(
    (variableName: string, newSliderState: VariableSliderState | undefined) => {
      setVariableSliderStates((old) => ({
        ...old,
        [variableName]: newSliderState,
      }));
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
                onChange={handleChange}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidersPanel;
