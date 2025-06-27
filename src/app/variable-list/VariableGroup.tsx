import { useState } from "react";
import styles from "./VariableList.module.css";
import { type Variable } from "@/features/simulation/Simulator";
import VariableItem from "./VariableItem";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon.svg?react";

const DEFAULT_OPEN_GROUPS = new Set(["Species"]);

export interface VariableGroupProps {
  group: string;
  variables: Variable[];
  isSearching: boolean;
  onVariableChange: (newValue: Variable) => void;
}

const VariableGroup = ({
  group,
  variables,
  isSearching,
  onVariableChange,
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
              onVariableChange={onVariableChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VariableGroup;
