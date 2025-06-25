import styles from "./VariableList.module.css";
import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import ClosedEyeIcon from "@/assets/icons/ClosedEyeIcon.svg?react";
import { type Variable } from "@/features/simulation/Simulator";

export interface VariableItemProps {
  variable: Variable;
}

const EYE_ICON_DIMS = 14;

const VariableItem = ({ variable }: VariableItemProps) => {
  return (
    <div className={styles.item}>
      <div className={styles.itemActionList}>
        <button className={styles.itemAction}>
          {/* TODO: add aria stuff to this */}
          {variable.visible ? (
            <EyeIcon height={EYE_ICON_DIMS} width={EYE_ICON_DIMS} />
          ) : (
            <ClosedEyeIcon height={EYE_ICON_DIMS} width={EYE_ICON_DIMS} />
          )}
        </button>
      </div>

      <span className={styles.itemName}>{variable.displayName}</span>
    </div>
  );
};

export default VariableItem;
