import { useId, useState } from "react";
import { clsx } from "clsx";

import styles from "./VariableList.module.css";

import SettingsIcon from "@/assets/icons/SettingsIcon.svg?react";

import Checkbox from "@/components/input/Checkbox";
import { Tooltip } from "@/components/Tooltip";

export interface GenericVariableItemProps {
  visible: boolean;
  onVisibleChange: (newVisible: boolean) => void;
  name: string;

  /** this should contain the content when the settings is open */
  children: React.ReactNode;
}

/**
 * A generic variable item that can be used for normal or dataset variables. */
const GenericVariableItem = ({
  visible,
  onVisibleChange,
  name,
  children,
}: GenericVariableItemProps) => {
  const visibilityCheckboxId = useId();
  const [settingsActive, setSettingsActive] = useState(false);

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
          <Checkbox
            className={styles.checkbox}
            name={visibilityCheckboxId}
            value={visible}
            onChange={(newValue) => onVisibleChange(newValue)}
          />
        </div>

        <label className={styles.itemName} htmlFor={visibilityCheckboxId}>
          {name}
        </label>

        <div className={styles.actionList}>
          <Tooltip text="Settings" side="right">
            <button
              className={clsx(styles.action, !settingsActive && styles.dim)}
              onClick={handleSettingsToggle}
            >
              <SettingsIcon height="1em" width="1em" />
            </button>
          </Tooltip>
        </div>
      </div>

      {settingsActive && <div className={styles.itemSettings}>{children}</div>}
    </div>
  );
};

export default GenericVariableItem;
