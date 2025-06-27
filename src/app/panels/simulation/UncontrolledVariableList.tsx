import { useAtom } from "jotai";
import { variablesAtom } from "@/stores/workspace";
import VariableList from "@/app/variable-list/VariableList";
import type { Variable } from "@/features/simulation/Simulator";
import { useCallback } from "react";

/**
 * VariableList that manages variables itself using the global variable state.
 */
const UncontrolledVariableList = () => {
  const [variables, setVariables] = useAtom(variablesAtom);
  const handleVariableChange = useCallback(
    (newVariable: Variable) => {
      console.log(newVariable);
      setVariables((prev) =>
        prev.map((v) => (v.name === newVariable.name ? newVariable : v)),
      );
    },
    [setVariables],
  );

  return (
    <VariableList
      variables={variables}
      onVariableChange={handleVariableChange}
    />
  );
};

export default UncontrolledVariableList;
