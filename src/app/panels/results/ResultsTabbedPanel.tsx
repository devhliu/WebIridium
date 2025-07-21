import { useAtomValue } from "jotai";

import GraphIcon from "@/assets/icons/GraphIcon.svg?react";
import TableIcon from "@/assets/icons/TableIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";

import TabbedPanel, { type TabInfo } from "@/components/TabbedPanel";
import PlotPanel from "./PlotPanel";
import TablePanel from "./TablePanel";
import SteadyStateResultPanel from "./SteadyStateResultPanel";

import { simulationResultAtom } from "@/globals/workspace/simulation";

const ResultTabbedPanel = () => {
  const simulationResult = useAtomValue(simulationResultAtom);
  let tabs: TabInfo[];
  if (simulationResult?.type === "steadyState") {
    tabs = [
      {
        name: "Steady State",
        icon: <SteadyStateIcon width="20" height="20" />,
        render: () => <SteadyStateResultPanel />,
      },
    ];
  } else {
    tabs = [
      {
        name: "Plot",
        icon: <GraphIcon width="20" height="20" />,
        render: () => <PlotPanel />,
      },
      {
        name: "Table",
        icon: <TableIcon width="20" height="20" />,
        render: () => <TablePanel />,
      },
    ];
  }

  if (simulationResult) {
    return <TabbedPanel tabs={tabs} data-testid="results-panel" />;
  } else {
    return null;
  }
};

export default ResultTabbedPanel;
