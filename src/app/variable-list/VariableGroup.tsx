import { useState } from "react";
import styles from "./VariableList.module.css";
import { type Variable } from "@/features/simulation/Simulator";
import VariableItem from "./VariableItem";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon.svg?react";
import type { VariableSettings } from "@/globals/workspace/settings";

const DEFAULT_OPEN_GROUPS = new Set(["Floating Species"]);

export interface VariableGroupProps {
  group: string;
  variables: Variable[];
  variableSettingss: Record<string, VariableSettings>;
  isSearching: boolean;
  onVariableSettingsChange: (
    variableName: string,
    newSettings: VariableSettings,
  ) => void;
}

const VariableGroup = ({
  group,
  variables,
  variableSettingss,
  isSearching,
  onVariableSettingsChange,
}: VariableGroupProps) => {
  const [open, setOpen] = useState(() => DEFAULT_OPEN_GROUPS.has(group));

  const handleClick = () => {
    if (!isSearching) {
      setOpen((prev) => !prev);
    }
  };

  // TODO: add accessibility stuff like aria-controlled by, etc.
  return (
    <div className={styles.groupContainer} data-open={open || null}>
      <button className={styles.groupTrigger} onClick={handleClick}>
        {!isSearching && (
          <ChevronDownIcon className={styles.groupTriggerIcon} />
        )}
        {group}
      </button>
      {(isSearching || open) && (
        <div className={styles.groupContent}>
          {variables?.map((v) => (
            <VariableItem
              key={v.name}
              variable={v}
              settings={variableSettingss[v.name]}
              onVariableSettingsChange={(newSettings) =>
                onVariableSettingsChange(v.name, newSettings)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VariableGroup;
