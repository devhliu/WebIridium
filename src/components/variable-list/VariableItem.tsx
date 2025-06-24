import styles from "./VariableList.module.css";
import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import { type Variable } from "@/features/simulation/Simulator";

export interface VariableItemProps {
  variable: Variable;
}

const VariableItem = ({ variable }: VariableItemProps) => {
  return (
    <div className={styles.item}>
      <div className={styles.itemActionList}>
        <button className={styles.itemAction}>
          {/* TODO: add aria stuff to this */}
          <EyeIcon height="14" width="14" />
        </button>
      </div>

      <span className={styles.itemName}>{variable.displayName}</span>
    </div>
  );
};

export default VariableItem;
