import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

import styles from "./HistoryPanel.module.css";
import PanelTitle from "./PanelTitle";

import { historyAtom, type HistoryRecord } from "@/globals/workspace/history";
import { millisecondsToText } from "@/features/timeUtils";
import { simulationResultAtom } from "@/globals/workspace/simulation";
import { currentRightPanelAtom } from "@/globals/workspace/layout";
import { updateEditorContentAtom } from "@/globals/workspace/model";

const HistoryItem = ({
  record,
  unixTimestampMs,
  onClick,
}: {
  record: HistoryRecord;
  unixTimestampMs: number;
  onClick: (record: HistoryRecord) => void;
}) => {
  const { simulationResult, unixTimestampMs: recordTimestampMs } = record;

  // prettier-ignore
  const title =
    simulationResult.type === "timeCourse" ? "Time Course Simulation"
    : simulationResult.type === "steadyState" ? "Steady State Simulation"
    : simulationResult.type === "parameterScan" && simulationResult.mode === "timeCourse" ? "Time Course Parameter Scan"
    : simulationResult.type === "parameterScan" && simulationResult.mode === "steadyState" ? "Steady State Parameter Scan"
    : "Unknown";

  const time = millisecondsToText(unixTimestampMs - recordTimestampMs, {
    ignoreSeconds: true,
  });

  return (
    <button className={styles.button} onClick={() => onClick(record)}>
      <span className={styles.buttonTitle}>{title}</span>
      <span className={styles.buttonTime}>{time + " ago"}</span>
    </button>
  );
};

export interface HistoryPanelProps {
  visible: boolean;
}

const HistoryPanel = ({ visible }: HistoryPanelProps) => {
  const history = useAtomValue(historyAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const setSimulationResult = useSetAtom(simulationResultAtom);
  const setCurrentRightPanel = useSetAtom(currentRightPanelAtom);
  const [timestampMs, setTimestampMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTimestampMs(Date.now());
    }, 60 * 1_000);

    return () => clearInterval(id);
  }, []);

  const handleRecordClick = (record: HistoryRecord) => {
    setSimulationResult(record.simulationResult);
    setCurrentRightPanel("Results");
    void updateEditorContent({ content: record.code, skipDebounce: true });
  };

  if (!visible) {
    return null;
  } else {
    return (
      <div className={styles.panel} data-testid="history-panel">
        <PanelTitle title="History" />
        {history.length === 0 ? (
          <p className={styles.noHistory}>No history</p>
        ) : (
          <div className={styles.list}>
            {history.toReversed().map((record) => (
              <HistoryItem
                key={record.unixTimestampMs}
                record={record}
                unixTimestampMs={timestampMs}
                onClick={handleRecordClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default HistoryPanel;
