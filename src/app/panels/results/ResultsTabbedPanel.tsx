import { useAtomValue } from "jotai";

import styles from "./results.module.css";

import GraphIcon from "@/assets/icons/GraphIcon.svg?react";
import TableIcon from "@/assets/icons/TableIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

import TabbedPanel, { type TabInfo } from "@/components/TabbedPanel";
import PlotPanel from "./PlotPanel";
import TablePanel from "./TablePanel";
import SteadyStateResultPanel from "./SteadyStateResultPanel";
import ExportPlotButton from "./exportButtons/ExportPlotButton";
import ExportTableButton from "./exportButtons/ExportTableButton";

import { simulationResultAtom } from "@/globals/workspace/simulation";
import IconButton from "@/components/IconButton";

export interface ResultTabbedPanelProps {
  onClose: () => void;
}

const ResultTabbedPanel = ({ onClose }: ResultTabbedPanelProps) => {
  const simulationResult = useAtomValue(simulationResultAtom);
  let tabs: TabInfo[];
  if (simulationResult?.type === "steadyState") {
    tabs = [
      {
        name: "Steady State",
        icon: <SteadyStateIcon width="20" height="20" />,
        render: () => <SteadyStateResultPanel />,
        renderActions: () => (
          <>
            <IconButton label="Close" onClick={onClose}>
              <CrossIcon width="1em" height="1em" />
            </IconButton>
          </>
        ),
      },
    ];
  } else {
    tabs = [
      {
        name: "Plot",
        icon: <GraphIcon width="20" height="20" />,
        render: () => <PlotPanel />,
        renderActions: () => (
          <>
            <IconButton label="Close" onClick={onClose}>
              <CrossIcon width="1em" height="1em" />
            </IconButton>
            <ExportPlotButton />
          </>
        ),
      },
      {
        name: "Table",
        icon: <TableIcon width="20" height="20" />,
        render: () => <TablePanel />,
        renderActions: () => (
          <>
            <IconButton label="Close" onClick={onClose}>
              <CrossIcon width="1em" height="1em" />
            </IconButton>
            <ExportTableButton />
          </>
        ),
      },
    ];
  }

  if (simulationResult) {
    return <TabbedPanel tabs={tabs} data-testid="results-panel" />;
  } else {
    return (
      <div className={styles.nothingContainer}>
        <p className={styles.nothingLabel}>Nothing yet...</p>
      </div>
    );
  }
};

export default ResultTabbedPanel;
