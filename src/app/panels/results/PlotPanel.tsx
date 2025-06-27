import { useRef } from "react";
import { useAtomValue } from "jotai";
import { simulationResultAtom } from "@/stores/workspace";
import styles from "./results.module.css";
import ResultsPlot from "./ResultsPlot";
import SettingsPanel from "./SettingsPanel.tsx";
import { Allotment } from "allotment";

export const PlotPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationResults = useAtomValue(simulationResultAtom);

  return (
    <div className={styles.panel}>
      <Allotment vertical>
        <div className={styles.plotContainer} ref={containerRef}>
          {!simulationResults ? (
            <span className={styles.nothingYetLabel}>"nothing yet..."</span>
          ) : (
            <ResultsPlot
              result={simulationResults}
              containerRef={containerRef}
            />
          )}
        </div>

        <Allotment.Pane preferredSize={250}>
          <div className={styles.settingsContainer}>
            <SettingsPanel />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default PlotPanel;
