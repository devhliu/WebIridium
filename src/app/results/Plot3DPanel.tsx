import { useAtomValue } from "jotai";

import styles from "./results.module.css";

import SeriesLineChart3D from "./visuals/SeriesLineChart3D";

import { simulationResultAtom } from "@/globals/simulation";

export const Plot3DPanel = () => {
  const result = useAtomValue(simulationResultAtom);

  if (!result || result?.type === "steadyState") {
    return null;
  }

  return (
    <div className={styles.plotContainer}>
      <SeriesLineChart3D result={result} />
    </div>
  );
};

export default Plot3DPanel;
