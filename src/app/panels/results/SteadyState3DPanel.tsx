import { useState } from "react";
import { useAtomValue } from "jotai";

import styles from "./results.module.css";

import SelectProperty from "@/components/property-list/SelectProperty";
import Results3DBarChart from "./Results3DBarChart";

import { simulationResultAtom } from "@/globals/workspace/simulation";

const ITEMS = [
  "Jacobian",
  "Flux Control",
  "Concentration Control",
  "Elasticities",
];

const ITEM_OPTIONS = Object.fromEntries(ITEMS.map((i) => [i, i]));

type Item = (typeof ITEMS)[number];

const SteadyState3DPanel = () => {
  const result = useAtomValue(simulationResultAtom);

  const [item, setItem] = useState<Item>("Jacobian");

  if (result?.type !== "steadyState") {
    return null;
  }

  // prettier-ignore
  const resultItem =
    item === "Jacobian" ? result.jacobian :
    item === "Flux Control" ? result.fluxControl :
    item === "Concentration Control" ? result.concentrationControl :
    result.elasticities;

  return (
    <div className={styles.panel}>
      <div className={styles.steadyStateThreeD}>
        <SelectProperty
          name="Item"
          value={item}
          options={ITEM_OPTIONS}
          onChange={setItem}
        />

        <Results3DBarChart name={item} data={resultItem} />
      </div>
    </div>
  );
};

export default SteadyState3DPanel;
