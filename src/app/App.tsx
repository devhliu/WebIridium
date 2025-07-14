// eslint-disable-next-line
import "allotment/dist/style.css";

import { useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { Allotment, LayoutPriority } from "allotment";

import styles from "./App.module.css";
import GraphIcon from "@/assets/icons/GraphIcon.svg?react";
import TableIcon from "@/assets/icons/TableIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";

import { simulationResultAtom } from "@/globals/workspace/simulation";

import WorkspaceProvider from "./WorkspaceProvider";
import Sidebar from "./Sidebar";
import AppMenubar from "./AppMenubar";
import AppStatusBar from "./AppStatusBar";
import { ToastProvider } from "@/components/Toast";

import TimeCoursePanel from "./panels/simulation/TimeCoursePanel";
import ParameterScanPanel from "./panels/simulation/ParameterScanPanel";
import EditorPanel from "./panels/EditorPanel";
import SteadyStatePanel from "./panels/simulation/SteadyStatePanel";
import PlotPanel from "./panels/results/PlotPanel";
import TablePanel from "./panels/results/TablePanel";
import SteadyStateResultPanel from "./panels/results/SteadyStateResultPanel";
import TabbedPanel, { type TabInfo } from "@/components/TabbedPanel";
import SlidersPanel from "./panels/sliders/SlidersPanel";
import ExamplesPanel from "./panels/ExamplesPanel";
import { currentSidebarTabAtom } from "@/globals/sidebar";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const didIntialLoadRef = useRef(false);
  return (
    <ToastProvider>
      <WorkspaceProvider didInitialLoadRef={didIntialLoadRef}>
        {children}
      </WorkspaceProvider>
    </ToastProvider>
  );
};

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

const AppContent = () => {
  const simulationResult = useAtomValue(simulationResultAtom);

  const currentTab = useAtomValue(currentSidebarTabAtom);

  const [slidersPanelActive, setSlidersPanelActive] = useState(false);

  return (
    <div className={styles.app}>
      <AppMenubar
        slidersPanelActive={slidersPanelActive}
        onSlidersPanelToggle={setSlidersPanelActive}
      />

      <div className={styles.appMain}>
        <Sidebar />

        <div className={styles.allotmentContainer}>
          <Allotment>
            <Allotment.Pane
              minSize={290}
              preferredSize={290}
              visible={currentTab !== null}
            >
              {/* There was a bug where accordion animation would play if accordion was closed on one panel and open on another.
                      Adding the `key` fixed that. */}
              <TimeCoursePanel
                key="timeCourse"
                visible={currentTab === "Time Course"}
                slidersPanelActive={slidersPanelActive}
                onSlidersPanelToggle={setSlidersPanelActive}
              />
              <ParameterScanPanel
                key="parameterScan"
                visible={currentTab === "Parameter Scan"}
                slidersPanelActive={slidersPanelActive}
                onSlidersPanelToggle={setSlidersPanelActive}
              />
              <SteadyStatePanel
                key="steadyState"
                visible={currentTab === "Steady State"}
                slidersPanelActive={slidersPanelActive}
                onSlidersPanelToggle={setSlidersPanelActive}
              />
              <ExamplesPanel visible={currentTab === "Examples"} />
            </Allotment.Pane>

            <Allotment.Pane priority={LayoutPriority.High}>
              <Allotment vertical>
                <Allotment.Pane priority={LayoutPriority.High}>
                  <EditorPanel />
                </Allotment.Pane>

                <Allotment.Pane
                  visible={slidersPanelActive}
                  preferredSize={250}
                >
                  {slidersPanelActive && (
                    <SlidersPanel
                      onClose={() => setSlidersPanelActive(false)}
                    />
                  )}
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>

            <Allotment.Pane
              visible={Boolean(simulationResult)}
              preferredSize={575}
            >
              <ResultTabbedPanel />
            </Allotment.Pane>
          </Allotment>
        </div>
      </div>

      <AppStatusBar />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
