import { useAtomValue } from "jotai";
import { simulationResultAtom } from "@/globals/simulation";
import styles from "./results.module.css";
import ArrayTable from "./visuals/ArrayTable";

export const TablePanel = () => {
  const simulationResults = useAtomValue(simulationResultAtom);

  return (
    <div className={styles.panel}>
      <div className={styles.tableContainer}>
        {simulationResults && <ArrayTable result={simulationResults} />}
      </div>
    </div>
  );
};

export default TablePanel;
