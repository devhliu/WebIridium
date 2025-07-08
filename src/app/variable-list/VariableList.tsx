import { useState } from "react";
import styles from "./VariableList.module.css";
import { groupVariables } from "@/features/category";
import { type VariableSettings } from "@/globals/workspace/settings";
import { type Variable } from "@/features/simulation/Simulator";
import VariableGroup from "./VariableGroup";
import SearchBox from "@/components/input/SearchBox";

export interface VariableListProps {
  variables: Variable[];
  variableSettingss: Record<string, VariableSettings>;
  onVariableSettingsChange: (
    variableName: string,
    newSettings: VariableSettings,
  ) => void;
}

// TODO: preserve state when closing/opening in accordion
const VariableList = ({
  variables,
  variableSettingss,
  onVariableSettingsChange,
}: VariableListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredVariables = variables.filter(
    (variable) =>
      variableSettingss[variable.name].displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      variable.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <SearchBox
        name="variable-search"
        placeholder="Variable Name"
        value={searchTerm}
        onChange={setSearchTerm}
      />
      {filteredVariables.length > 0 ? (
        <div className={styles.list}>
          {groupVariables(filteredVariables).map(([group, vars]) => (
            <VariableGroup
              key={group}
              group={group}
              variables={vars}
              variableSettingss={variableSettingss}
              onVariableSettingsChange={onVariableSettingsChange}
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
