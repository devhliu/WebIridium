import { useState } from "react";
import { clsx } from "clsx";

import styles from "./VariableList.module.css";
import checkboxStyles from "@/components/input/Checkbox.module.css";

import CheckIcon from "@/assets/icons/CheckIcon.svg?react";
import SettingsIcon from "@/assets/icons/SettingsIcon.svg?react";

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
          <button
            className={clsx(
              styles.action,
              checkboxStyles.root,
              styles.visibleAction,
              !visible && styles.dim,
            )}
            onClick={() => onVisibleChange(!visible)}
            data-state={visible ? "checked" : null}
          >
            {/* TODO: add aria stuff to this */}
            {visible && (
              <CheckIcon
                className={checkboxStyles.indicator}
                height="1em"
                width="1em"
              />
            )}
          </button>
        </div>

        {/* TODO: this should probably be a label and the visibility toggle a checkbox? */}
        <button
          className={styles.itemName}
          onClick={() => onVisibleChange(!visible)}
        >
          {name}
        </button>

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
