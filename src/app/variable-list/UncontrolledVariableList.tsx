import { useAtom, useAtomValue } from "jotai";
import { variablesAtom } from "@/stores/workspace/model";
import {
  variableSettingssAtom,
  type VariableSettings,
} from "@/stores/workspace/settings";
import VariableList from "@/app/variable-list/VariableList";
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
      setVariableSettingss({
        ...variableSettingss,
        [variableName]: newSettings,
      });
    },
    [variableSettingss, setVariableSettingss],
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
