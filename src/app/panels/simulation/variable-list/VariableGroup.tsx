import { useState } from "react";
import clsx from "clsx";

import styles from "./VariableList.module.css";
import checkboxStyles from "@/components/input/Checkbox.module.css";

import { type Variable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";
import VariableItem from "./VariableItem";
import { Tooltip } from "@/components/Tooltip";

import ChevronDownIcon from "@/assets/icons/ChevronDownIcon.svg?react";
import CheckIcon from "@/assets/icons/CheckIcon.svg?react";
import DashIcon from "@/assets/icons/DashIcon.svg?react";

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
              className={clsx(
                styles.action,
                styles.visibleAction,
                checkboxStyles.root,
                !areAllVisible && styles.dim,
              )}
              data-state={
                areAllVisible
                  ? "checked"
                  : areSomeVisible
                    ? "indeterminate"
                    : null
              }
              onClick={handleToggleAll}
            >
              {areAllVisible ? (
                <CheckIcon
                  className={checkboxStyles.indiactor}
                  height="1em"
                  width="1em"
                />
              ) : areSomeVisible ? (
                <DashIcon
                  className={checkboxStyles.indiactor}
                  height="1em"
                  width="1em"
                />
              ) : null}
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
