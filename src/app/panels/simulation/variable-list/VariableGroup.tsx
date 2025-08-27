import { useState } from "react";
import clsx from "clsx";
import styles from "./VariableList.module.css";

import { type Variable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";
import VariableItem from "./VariableItem";
import { Tooltip } from "@/components/Tooltip";

import ChevronDownIcon from "@/assets/icons/ChevronDownIcon.svg?react";
import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import ClosedEyeIcon from "@/assets/icons/ClosedEyeIcon.svg?react";

const DEFAULT_OPEN_GROUPS = new Set(["Floating Species"]);

export interface VariableGroupProps {
  group: string;
  variables: Variable[];
  variableSettingss: Record<string, VariableSettings>;
  onVariableSettingsChange: (
    variableName: string,
    newSettings: VariableSettings,
  ) => void;
  isSearching: boolean;
}

const VariableGroup = ({
  group,
  variables,
  variableSettingss,
  onVariableSettingsChange,
  isSearching,
}: VariableGroupProps) => {
  const [open, setOpen] = useState(DEFAULT_OPEN_GROUPS.has(group));

  const areAllVisible = variables.every(
    (v) => variableSettingss[v.name].visible,
  );

  const areSomeVisible = variables.some(
    (v) => variableSettingss[v.name].visible,
  );

  const handleToggleOpen = () => {
    if (!isSearching) {
      setOpen(!open);
    }
  };

  const handleToggleAll = () => {
    setOpen(true);
    for (const v of variables) {
      onVariableSettingsChange(v.name, {
        ...variableSettingss[v.name],
        visible: !areAllVisible,
      });
    }
  };

  // TODO: add accessibility stuff like aria-controlled by, etc.
  return (
    <div className={styles.groupContainer} data-open={open || null}>
      <div className={styles.groupTitle}>
        <button className={styles.groupTrigger} onClick={handleToggleOpen}>
          {!isSearching && (
            <ChevronDownIcon className={styles.groupTriggerIcon} />
          )}
          {group}
        </button>

        <div className={styles.actionList}>
          <Tooltip text="Group Visibility" side="right">
            <button
              className={clsx(styles.action, !areAllVisible && styles.dim)}
              onClick={handleToggleAll}
            >
              {areAllVisible || areSomeVisible ? (
                <EyeIcon height="1em" width="1em" />
              ) : (
                <ClosedEyeIcon height="1em" width="1em" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

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
