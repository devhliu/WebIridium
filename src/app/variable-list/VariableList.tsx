import { useState } from "react";
import styles from "./VariableList.module.css";
import { groupVariables } from "@/features/category";
import { type Variable } from "@/features/simulation/Simulator";
import VariableGroup from "./VariableGroup";
import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

export interface VariableListProps {
  variables: Variable[];
  onVariableChange: (newValue: Variable) => void;
}

// TODO: preserve state when closing/opening in accordion
const VariableList = ({ variables, onVariableChange }: VariableListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredVariables = variables.filter((variable) =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <SearchIcon className={styles.searchIcon} height="14" width="14" />
        <input
          className={styles.searchInput}
          type="search"
          name="variable-search"
          placeholder="Variable name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredVariables.length > 0 ? (
        <div className={styles.list}>
          {groupVariables(filteredVariables).map(([group, vars]) => (
            <VariableGroup
              key={group}
              group={group}
              variables={vars}
              onVariableChange={onVariableChange}
              isSearching={searchTerm.length > 0}
            />
          ))}
        </div>
      ) : (
        <div className={styles.nothingFound}>No variables</div>
      )}
    </div>
  );
};

export default VariableList;
