import { useState } from "react";
import styles from "./VariableList.module.css";

import { groupVariables } from "@/features/category";
import { type VariableSettings } from "@/globals/workspace/settings";
import { type Variable } from "@/features/simulation/Simulator";

import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import ClosedEyeIcon from "@/assets/icons/ClosedEyeIcon.svg?react";

import VariableGroup from "./VariableGroup";
import SearchBox from "@/components/input/SearchBox";
import Button from "@/components/Button";

const DEFAULT_OPEN_GROUPS = {
  ["Floating Species"]: true,
};

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
  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(DEFAULT_OPEN_GROUPS);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredVariables = variables.filter(
    (variable) =>
      variableSettingss[variable.name].displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      variable.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const areAllVisible = variables.every(
    (v) => variableSettingss[v.name].visible,
  );

  const toggleAllVisible = () => {
    for (const variable of variables) {
      onVariableSettingsChange(variable.name, {
        ...variableSettingss[variable.name],
        visible: !areAllVisible,
      });
    }

    const groups = new Set<string>();
    for (const v of variables) {
      groups.add(v.category);
    }
    setOpenGroups(
      Object.fromEntries(
        Array.from(groups.keys()).map((group) => [group, true]),
      ),
    );
  };

  const toggleGroupOpen = (group: string, open: boolean) => {
    setOpenGroups({
      ...openGroups,
      [group]: open,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <SearchBox
          className={styles.searchBox}
          name="variable-search"
          placeholder="Variable Name"
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <Button onClick={toggleAllVisible}>
          {areAllVisible ? (
            <ClosedEyeIcon width="1em" height="1em" />
          ) : (
            <EyeIcon width="1em" height="1em" />
          )}
          {areAllVisible ? "Hide All" : "Show All"}
        </Button>
      </div>
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
              open={openGroups[group]}
              onOpenChange={(open) => toggleGroupOpen(group, open)}
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
