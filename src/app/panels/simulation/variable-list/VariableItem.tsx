import { memo, useState } from "react";
import { clsx } from "clsx";

import styles from "./VariableList.module.css";
import checkboxStyles from "@/components/input/Checkbox.module.css";

import CheckIcon from "@/assets/icons/CheckIcon.svg?react";
import SettingsIcon from "@/assets/icons/SettingsIcon.svg?react";

import { type Variable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";
import VariableSettingsPropertyList from "./VariableSettingsPropertyList";
import { Tooltip } from "@/components/Tooltip";

export interface VariableItemProps {
  variable: Variable;
  settings: VariableSettings;
  onVariableSettingsChange: (newSettings: VariableSettings) => void;
}

// TODO: this should be in the css? but it can't be??? how to get this into css??
const ICON_DIMS = 14;

const VariableItem = memo(
  ({ settings, onVariableSettingsChange }: VariableItemProps) => {
    const [settingsActive, setSettingsActive] = useState(false);

    const handleVisiblityToggle = () => {
      onVariableSettingsChange({
        ...settings,
        visible: !settings.visible,
      });
    };

    const handleSettingsToggle = () => {
      setSettingsActive(!settingsActive);
    };

    return (
      <div
        className={styles.item}
        data-expanded={settingsActive ? true : undefined}
      >
        <div className={styles.itemStrip}>
          <div className={styles.actionList}>
            <button
              className={clsx(
                styles.action,
                checkboxStyles.root,
                styles.visibleAction,
                !settings.visible && styles.dim,
              )}
              onClick={handleVisiblityToggle}
              data-state={settings.visible ? "checked" : null}
            >
              {/* TODO: add aria stuff to this */}
              {settings.visible && (
                <CheckIcon
                  className={checkboxStyles.indicator}
                  height="1em"
                  width="1em"
                />
              )}
            </button>
          </div>

          {/* TODO: this should probably be a label and the visibility toggle a checkbox? */}
          <button className={styles.itemName} onClick={handleVisiblityToggle}>
            {settings.displayName}
          </button>

          <div className={styles.actionList}>
            <Tooltip text="Settings" side="right">
              <button
                className={clsx(styles.action, !settingsActive && styles.dim)}
                onClick={handleSettingsToggle}
              >
                <SettingsIcon height={ICON_DIMS} width={ICON_DIMS} />
              </button>
            </Tooltip>
          </div>
        </div>

        {settingsActive && (
          <div className={styles.itemSettings}>
            <VariableSettingsPropertyList
              settings={settings}
              onVariableSettingsChange={onVariableSettingsChange}
            />
          </div>
        )}
      </div>
    );
  },
);

export default VariableItem;
