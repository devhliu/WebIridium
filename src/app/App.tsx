// eslint-disable-next-line
import "allotment/dist/style.css";

import { useRef } from "react";
import { useAtom } from "jotai";
import { Allotment, LayoutPriority } from "allotment";

import styles from "./App.module.css";

import {
  currentLeftPanelAtom,
  currentBottomPanelAtom,
  currentVeryRightPanelAtom,
  LEFT_PANELS,
  currentRightPanelAtom,
} from "@/globals/workspace/layout";

import WorkspaceProvider from "./WorkspaceProvider";
import Sidebar from "./Sidebar";
import AppMenubar from "./AppMenubar";
import AppStatusBar from "./AppStatusBar";
import { ToastProvider } from "@/components/Toast";

import TimeCoursePanel from "./panels/simulation/TimeCoursePanel";
import ParameterScanPanel from "./panels/simulation/ParameterScanPanel";
import EditorPanel from "./panels/EditorPanel";
import SteadyStatePanel from "./panels/simulation/SteadyStatePanel";
import SlidersPanel from "./panels/sliders/SlidersPanel";
import HistoryPanel from "./panels/HistoryPanel";
import ExamplesPanel from "./panels/ExamplesPanel";
import ResultTabbedPanel from "./panels/results/ResultsTabbedPanel";
import PlotSettingsPanel from "./panels/PlotSettingsPanel";

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

const AppContent = () => {
  const [currentLeftPanel, setCurrentLeftPanel] = useAtom(currentLeftPanelAtom);
  const [currentRightPanel, setCurrentRightPanel] = useAtom(
    currentRightPanelAtom,
  );
  const [currentBottomPanel, setCurrentBottomPanel] = useAtom(
    currentBottomPanelAtom,
  );
  const [currentVeryRightPanel, setCurrentVeryRightPanel] = useAtom(
    currentVeryRightPanelAtom,
  );

  return (
    <div className={styles.app}>
      <AppMenubar />

      <div className={styles.appMain}>
        <Sidebar
          panels={LEFT_PANELS}
          currentPanel={currentLeftPanel}
          onPanelChange={setCurrentLeftPanel}
        />

        <div className={styles.allotmentContainer}>
          <Allotment>
            <Allotment.Pane
              minSize={290}
              preferredSize={290}
              visible={currentLeftPanel !== null}
            >
              <TimeCoursePanel visible={currentLeftPanel === "Time Course"} />
              <ParameterScanPanel
                visible={currentLeftPanel === "Parameter Scan"}
              />
              <SteadyStatePanel visible={currentLeftPanel === "Steady State"} />
              <HistoryPanel visible={currentLeftPanel === "History"} />
              <ExamplesPanel visible={currentLeftPanel === "Examples"} />
            </Allotment.Pane>

            <Allotment.Pane priority={LayoutPriority.High}>
              <Allotment vertical>
                <Allotment.Pane priority={LayoutPriority.High}>
                  <EditorPanel />
                </Allotment.Pane>

                <Allotment.Pane
                  visible={Boolean(currentBottomPanel)}
                  preferredSize={250}
                >
                  {currentBottomPanel === "Sliders" && (
                    <SlidersPanel onClose={() => setCurrentBottomPanel(null)} />
                  )}
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>

            <Allotment.Pane
              visible={Boolean(currentRightPanel)}
              preferredSize={575}
            >
              {currentRightPanel === "Results" && (
                <ResultTabbedPanel onClose={() => setCurrentRightPanel(null)} />
              )}
            </Allotment.Pane>

            <Allotment.Pane
              visible={Boolean(currentVeryRightPanel)}
              preferredSize={450}
            >
              {currentVeryRightPanel === "Plot Settings" && (
                <PlotSettingsPanel
                  onClose={() => setCurrentVeryRightPanel(null)}
                />
              )}
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
