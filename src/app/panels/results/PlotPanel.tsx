import { useRef, useState, useLayoutEffect } from "react";
import { useAtomValue } from "jotai";
import { simulationResultAtom } from "@/globals/workspace/simulation.ts";
import { datasetsAtom } from "@/globals/workspace/overlays.ts";
import styles from "./results.module.css";
import SeriesLineChart from "./visuals/SeriesLineChart";
import { Allotment } from "allotment";
import PlotQuickActionsPanel from "./PlotQuickActionsPanel.tsx";

export const PlotPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationResults = useAtomValue(simulationResultAtom);
  const datasets = useAtomValue(datasetsAtom);
  const [[width, height], setDimensions] = useState([0, 0]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const styles = window.getComputedStyle(containerRef.current);
        const size = containerRef.current.getBoundingClientRect();

        setDimensions([
          size.width -
            parseFloat(styles.getPropertyValue("padding-left")) -
            parseFloat(styles.getPropertyValue("padding-right")),
          size.height -
            parseFloat(styles.getPropertyValue("padding-top")) -
            parseFloat(styles.getPropertyValue("padding-bottom")),
        ]);
      }
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        updateSize();
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <div className={styles.panel}>
      <Allotment vertical>
        <div className={styles.plotContainer} ref={containerRef}>
          {simulationResults && (
            <SeriesLineChart
              result={simulationResults}
              datasets={datasets}
              height={height}
              width={width}
            />
          )}
        </div>

        <Allotment.Pane preferredSize={200}>
          <PlotQuickActionsPanel />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default PlotPanel;
