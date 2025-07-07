import { useAtomValue } from "jotai";
import { simulationResultAtom } from "@/globals/workspace/simulation.ts";
import styles from "./results.module.css";
import ResultsTable from "./ResultsTable.tsx";

export const TablePanel = () => {
  const simulationResults = useAtomValue(simulationResultAtom);

  return (
    <div className={styles.panel}>
      <div className={styles.tableContainer}>
        {!simulationResults ? (
          "nothing yet..."
        ) : (
          <ResultsTable result={simulationResults} />
        )}
      </div>
    </div>
  );
};

export default TablePanel;
