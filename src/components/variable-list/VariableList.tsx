import { useState } from "react";
import styles from "./VariableList.module.css";
import { type Variable } from "@/features/simulation/Simulator";
import VariableGroup from "./VariableGroup";
import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

export interface VariableListProps {
  variables: Variable[];
  onVariableChange: (newValue: Variable) => void;
}

const CATEGORY_ORDER = ["Species", "Rate of Changes", "Parameter"];

// TODO: preserve state when closing/opening in accordion
const VariableList = ({ variables, onVariableChange }: VariableListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredVariables = variables.filter((variable) =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const groupedVariables = Object.groupBy(filteredVariables, (v) => v.category);
  const sortedGroupedVariables = Object.entries(groupedVariables).toSorted(
    ([a, _], [b, __]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
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
          {sortedGroupedVariables.map(([group, vars]) =>
            vars ? (
              <VariableGroup
                key={group}
                group={group}
                variables={vars}
                onVariableChange={onVariableChange}
                isSearching={searchTerm.length > 0}
              />
            ) : null,
          )}
        </div>
      ) : (
        <div className={styles.nothingFound}>No variables</div>
      )}
    </div>
  );
};

export default VariableList;
