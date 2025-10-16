import { useState } from "react";
import { useAtomValue } from "jotai";

import styles from "./results.module.css";

import SelectProperty from "@/components/property-list/SelectProperty";
import ArrayBarChart3D from "./visuals/ArrayBarChart3D";

import { simulationResultAtom } from "@/globals/simulation";

const ITEMS = [
  "Jacobian",
  "Flux Control",
  "Concentration Control",
  "Elasticities",
];

const AXES: { [name: string]: { x: string; y: string; z: string } } = {
  Jacobian: { x: "X", y: "Y", z: "Z" },
  "Flux Control": { x: "Reaction", y: "Flux", z: "Coefficient" },
  "Concentration Control": { x: "Reaction", y: "Species", z: "Coefficient" },
  Elasticities: { x: "Species", y: "Reaction", z: "Elasticity" },
};

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
      <div className={styles.steadyState3DPanel}>
        <SelectProperty
          name="Item"
          value={item}
          options={ITEM_OPTIONS}
          onChange={setItem}
        />

        <ArrayBarChart3D
          name={item}
          data={resultItem}
          x={AXES[item].x}
          y={AXES[item].y}
          z={AXES[item].z}
        />
      </div>
    </div>
  );
};

export default SteadyState3DPanel;
