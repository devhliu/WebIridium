import styles from "./VariableList.module.css";
import { type Variable } from "@/features/simulation/Simulator";
import VariableItem from "./VariableItem";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon.svg?react";
import type { VariableSettings } from "@/globals/workspace/settings";

export interface VariableGroupProps {
  group: string;
  variables: Variable[];
  variableSettingss: Record<string, VariableSettings>;
  onVariableSettingsChange: (
    variableName: string,
    newSettings: VariableSettings,
  ) => void;
  isSearching: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VariableGroup = ({
  group,
  variables,
  variableSettingss,
  onVariableSettingsChange,
  isSearching,
  open,
  onOpenChange,
}: VariableGroupProps) => {
  const handleToggle = () => {
    if (!isSearching) {
      onOpenChange(!open);
    }
  };

  // TODO: add accessibility stuff like aria-controlled by, etc.
  return (
    <div className={styles.groupContainer} data-open={open || null}>
      <button className={styles.groupTrigger} onClick={handleToggle}>
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
