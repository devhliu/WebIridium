import { useAtomValue } from "jotai";
import { variablesAtom, variableSettingssAtom } from "@/stores/workspace";
import { groupVariables } from "@/features/category";
import styles from "./SlidersPanel.module.css";
import VariableSlider from "./VariableSlider";

const SlidersPanel = () => {
  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  
  const filteredVariables = variables.filter(v => v.scanName);
  const groups = groupVariables(filteredVariables);

  return (
    <div className={styles.panel}>
      <div className={styles.sliders}>
        {groups.map(([group, vars]) => 
          <div key={group} className={styles.group}>
            <h3 className={styles.groupTitle}>{group}</h3>
            {vars.map(v => <VariableSlider key={v.name} variable={v} settings={variableSettingss[v.name]} />)}
          </div>)}
      </div>
    </div>
  );
};

export default SlidersPanel;
