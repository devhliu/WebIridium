import { memo, useState } from "react";
import { clsx } from "clsx";

import styles from "./VariableList.module.css";
import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import ClosedEyeIcon from "@/assets/icons/ClosedEyeIcon.svg?react";
import SettingsIcon from "@/assets/icons/SettingsIcon.svg?react";
import { type Variable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/stores/workspace";
import VariableSettingsPropertyList from "./VariableSettingsPropertyList";

export interface VariableItemProps {
  variable: Variable;
  variableSettings: VariableSettings;
  onVariableSettingsChange: (newSettings: VariableSettings) => void;
}

// TODO: this should be in the css? but it can't be??? how to get this into css??
const ICON_DIMS = 14;

const VariableItem = memo(
  ({
    variable,
    variableSettings,
    onVariableSettingsChange,
  }: VariableItemProps) => {
    const [settingsActive, setSettingsActive] = useState(false);

    const handleVisiblityToggle = () => {
      onVariableSettingsChange({
        ...variableSettings,
        visible: !variableSettings.visible,
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
          <div className={styles.itemActionList}>
            <button
              className={styles.itemAction}
              onClick={handleVisiblityToggle}
            >
              {/* TODO: add aria stuff to this */}
              {variableSettings.visible ? (
                <EyeIcon height="1em" width="1em" />
              ) : (
                <ClosedEyeIcon height="1em" width="1em" />
              )}
            </button>
          </div>

          <span className={styles.itemName}>{variable.displayName}</span>

          <div className={styles.itemActionList}>
            <button
              className={clsx(styles.itemAction, !settingsActive && styles.dim)}
              onClick={handleSettingsToggle}
            >
              <SettingsIcon height={ICON_DIMS} width={ICON_DIMS} />
            </button>
          </div>
        </div>

        {settingsActive && (
          <div className={styles.itemSettings}>
            <VariableSettingsPropertyList
              settings={variableSettings}
              onVariableSettingsChange={onVariableSettingsChange}
            />
          </div>
        )}
      </div>
    );
  },
);

export default VariableItem;
