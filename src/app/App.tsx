import { useState } from "react";
import { useAtomValue } from "jotai";

import styles from "./App.module.css";
import GraphIcon from "@/assets/icons/GraphIcon.svg?react";
import TableIcon from "@/assets/icons/TableIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";

import { simulationResultAtom } from "@/stores/workspace";

import PanelLayout from "@/components/PanelLayout";
import { WorkspaceProvider } from "@/features/workspace";
import Sidebar, { type SidebarTab } from "./Sidebar";
import AppMenubar from "./AppMenubar";
import { ToastProvider } from "@/components/Toast";

import TimeCoursePanel from "./panels/simulation/TimeCoursePanel";
import ParameterScanPanel from "./panels/simulation/ParameterScanPanel";
import AntimonyEditorPanel from "./panels/AntimonyEditorPanel";
import SteadyStatePanel from "./panels/simulation/SteadyStatePanel";
import PlotPanel from "./panels/results/PlotPanel";
import TablePanel from "./panels/results/TablePanel";
import SteadyStateResultPanel from "./panels/results/SteadyStateResultPanel";
import TabbedPanel, { type TabInfo } from "@/components/TabbedPanel";

const ResultTabbedPanel = () => {
  const simulationResults = useAtomValue(simulationResultAtom);
  let tabs: TabInfo[];
  if (simulationResults?.type === "steadyState") {
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

  return <TabbedPanel tabs={tabs} />;
};

const App = () => {
  const [tab, setTab] = useState<SidebarTab>("TimeCourse");
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <div className={styles.app}>
          <AppMenubar />
          <div className={styles.appMain}>
            <Sidebar
              tabs={["TimeCourse", "SteadyState", "ParameterScan"]}
              currentTab={tab}
              onTabChange={setTab}
            />

            <PanelLayout>
              <TimeCoursePanel visible={tab === "TimeCourse"} />
              <ParameterScanPanel visible={tab === "ParameterScan"} />
              <SteadyStatePanel visible={tab === "SteadyState"} />

              <AntimonyEditorPanel />

              <ResultTabbedPanel />
            </PanelLayout>
          </div>
        </div>
      </WorkspaceProvider>
    </ToastProvider>
  );
};

export default App;
