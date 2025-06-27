import { useAtom, useAtomValue } from "jotai";
import styles from "./IndependentVariableSelector.module.css";
import { independentVariableAtom, variablesAtom } from "@/stores/workspace";
import { groupVariablesForSelectComponent } from "@/features/category";
import Select from "@/components/input/Select";

const INDEPENDENT_VARIABLE_CATEGORIES = new Set(["Time", "Species"]);

const IndependentVariableSelector = () => {
  const [indepedentVariable, setIndependentVariable] = useAtom(
    independentVariableAtom,
  );
  const variables = useAtomValue(variablesAtom);
  const filteredVariables = variables.filter((v) =>
    INDEPENDENT_VARIABLE_CATEGORIES.has(v.category),
  );

  return (
    <Select
      name="Variable"
      value={indepedentVariable ?? "???"}
      groups={groupVariablesForSelectComponent(
        filteredVariables,
        (v) => v.name,
      )}
      onChange={(name) => setIndependentVariable(name)}
      className={styles.select}
    />
  );
};

export default IndependentVariableSelector;
