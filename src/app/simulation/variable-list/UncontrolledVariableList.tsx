import { useAtom, useAtomValue } from "jotai";
import { variablesAtom } from "@/globals/model";
import {
  variableSettingssAtom,
  type VariableSettings,
} from "@/globals/settings";
import VariableList from "@/app/simulation/variable-list/VariableList";
import { useCallback } from "react";

/**
 * VariableList that manages variables itself using the global variable state.
 */
const UncontrolledVariableList = () => {
  const variables = useAtomValue(variablesAtom);
  const [variableSettingss, setVariableSettingss] = useAtom(
    variableSettingssAtom,
  );

  const handleVariableSettingsChange = useCallback(
    (variableName: string, newSettings: VariableSettings) => {
      setVariableSettingss((old) => ({
        ...old,
        [variableName]: newSettings,
      }));
    },
    [setVariableSettingss],
  );

  return (
    <VariableList
      variables={variables}
      variableSettingss={variableSettingss}
      onVariableSettingsChange={handleVariableSettingsChange}
    />
  );
};

export default UncontrolledVariableList;
