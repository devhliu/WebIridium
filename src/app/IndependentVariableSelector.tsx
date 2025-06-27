import { useAtom, useAtomValue } from "jotai";
import styles from "./IndependentVariableSelector.module.css";
import { independentVariableAtom, variablesAtom } from "@/stores/workspace";
import Select from "@/components/input/Select";

const INDEPENDENT_VARIABLE_CATEGORIES = new Set(["Time", "Species"]);

const IndependentVariableSelector = () => {
  const [indepedentVariable, setIndependentVariable] = useAtom(
    independentVariableAtom,
  );
  const variables = useAtomValue(variablesAtom);
  const groupedVariables = Object.groupBy(
    variables.filter((v) => INDEPENDENT_VARIABLE_CATEGORIES.has(v.category)),
    (v) => v.category,
  );
  const mappedVariables: [string, Record<string, string>][] = Object.entries(groupedVariables).map(
    ([group, vars]) => [
      group,
      Object.fromEntries(vars?.map((v) => [v.displayName, v.name]) ?? []),
    ],
  );

  return (
    <Select
      name="Variable"
      value={indepedentVariable ?? "???"}
      groups={Object.fromEntries(mappedVariables)}
      onChange={(name) => setIndependentVariable(name)}
      className={styles.select}
    />
  );
};

export default IndependentVariableSelector;
