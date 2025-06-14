import { useRef } from "react";
import { useAtomValue } from "jotai";
import { simulationResultAtom } from "@/stores/workspace";
import styles from "./results.module.css";
import ResultsPlot from "./ResultsPlot";
import SettingsPanel from "./SettingsPanel.tsx";

export const PlotPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationResults = useAtomValue(simulationResultAtom);

  return (
    <div className={styles.panel}>
      <div className={styles.plotContainer} ref={containerRef}>
        {!simulationResults ? (
          "nothing yet..."
        ) : (
          <ResultsPlot result={simulationResults} containerRef={containerRef} />
        )}
      </div>

      <div className={styles.settingsContainer}>
        <SettingsPanel />
      </div>
    </div>
  );
};

export default PlotPanel;
