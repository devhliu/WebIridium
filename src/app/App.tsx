// eslint-disable-next-line
import "allotment/dist/style.css";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { Allotment } from "allotment";

import styles from "./App.module.css";
import GraphIcon from "@/assets/icons/GraphIcon.svg?react";
import TableIcon from "@/assets/icons/TableIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";

import { simulationResultAtom } from "@/stores/workspace";

import { WorkspaceProvider } from "@/features/workspace";
import Sidebar, { type SidebarTab } from "./Sidebar";
import AppMenubar from "./AppMenubar";
import AppStatusBar from "./AppStatusBar";
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
  const tabs: SidebarTab[] = ["Time Course", "Steady State", "Parameter Scan"];
  const [tab, setTab] = useState<SidebarTab>("Time Course");

  return (
    <div className={styles.app}>
      <ToastProvider>
        <WorkspaceProvider>
          <AppMenubar
            sidebarTab={tab}
            sidebarTabs={tabs}
            onSidebarTabChange={setTab}
          />

          <div className={styles.appMain}>
            <Sidebar tabs={tabs} currentTab={tab} onTabChange={setTab} />

            <div className={styles.allotmentContainer}>
              <Allotment>
                <Allotment.Pane minSize={320} preferredSize={320}>
                  {/* There was a bug where accordion animation would play if accordion was closed on one panel and open on another.
                      Adding the `key` fixed that. */}
                  <TimeCoursePanel
                    key="timeCourse"
                    visible={tab === "Time Course"}
                  />
                  <ParameterScanPanel
                    key="parameterScan"
                    visible={tab === "Parameter Scan"}
                  />
                  <SteadyStatePanel
                    key="steadyState"
                    visible={tab === "Steady State"}
                  />
                </Allotment.Pane>

                <AntimonyEditorPanel />

                <Allotment.Pane preferredSize={575}>
                  <ResultTabbedPanel />
                </Allotment.Pane>
              </Allotment>
            </div>
          </div>

          <AppStatusBar />
        </WorkspaceProvider>
      </ToastProvider>
    </div>
  );
};

export default App;
