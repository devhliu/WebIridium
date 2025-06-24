import { useState } from "react";
import styles from "./VariableList.module.css";
import { type Variable } from "@/features/simulation/Simulator";
import VariableItem from "./VariableItem";
import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

export interface VariableListProps {
  variables: Variable[];
}

const CATEGORY_ORDER = ["Species", "Parameter"];

const VariableGroup = ({
  group,
  variables,
}: {
  group: string;
  variables: Variable[];
}) => {
  return (
    <details key={group} className={styles.groupDetails}>
      <summary className={styles.groupSummary}>{group}</summary>
      {variables?.map((v) => <VariableItem key={v.name} variable={v} />)}
    </details>
  );
};

const VariableList = ({ variables }: VariableListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredVariables = variables.filter((variable) =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const groupedVariables = Object.groupBy(filteredVariables, (v) => v.category);
  const sortedGroupedVariables = Object.entries(groupedVariables).toSorted(
    ([a, _], [b, __]) =>
      (CATEGORY_ORDER.indexOf(a) ?? 10) - (CATEGORY_ORDER.indexOf(b) ?? 10),
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
            vars ? <VariableGroup group={group} variables={vars} /> : null,
          )}
        </div>
      ) : (
        <div className={styles.nothingFound}>No variables</div>
      )}
    </div>
  );
};

export default VariableList;
