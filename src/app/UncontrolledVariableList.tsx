import { useAtom } from "jotai";
import { variablesAtom } from "@/stores/workspace";
import VariableList from "@/components/variable-list/VariableList";

/**
 * VariableList that manages variables itself using the global variable state.
 */
const UncontrolledVariableList = () => {
  const [variables, _] = useAtom(variablesAtom);
  return <VariableList variables={variables} />;
};

export default UncontrolledVariableList;
