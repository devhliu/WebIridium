import { useAtomValue } from "jotai";

import styles from "./results.module.css";

import Results3DLineChart from "./Results3DLineChart";

import { simulationResultAtom } from "@/globals/workspace/simulation";

export const Chart3DLinePanel = () => {
  const result = useAtomValue(simulationResultAtom);

  if (!result || result?.type === "steadyState") {
    return null;
  }

  return (
    <div className={styles.plotContainer}>
      <Results3DLineChart result={result} />
    </div>
  );
};

export default Chart3DLinePanel;
