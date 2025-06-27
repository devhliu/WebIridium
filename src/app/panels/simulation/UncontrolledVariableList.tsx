import { useAtom } from "jotai";
import { variablesAtom } from "@/stores/workspace";
import VariableList from "@/app/variable-list/VariableList";
import type { Variable } from "@/features/simulation/Simulator";

/**
 * VariableList that manages variables itself using the global variable state.
 */
const UncontrolledVariableList = () => {
  const [variables, setVariables] = useAtom(variablesAtom);
  const handleVariableChange = (newVariable: Variable) => {
    setVariables((prev) =>
      prev.map((v) => (v.name === newVariable.name ? newVariable : v)),
    );
  };

  return (
    <VariableList
      variables={variables}
      onVariableChange={handleVariableChange}
    />
  );
};

export default UncontrolledVariableList;
