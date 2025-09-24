// eslint-disable-next-line
import "allotment/dist/style.css";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Allotment, LayoutPriority } from "allotment";

import styles from "./App.module.css";

import { setTheme, themeMediaQuery } from "@/features/theme";

import {
  currentLeftPanelAtom,
  currentBottomPanelAtom,
  currentVeryRightPanelAtom,
  LEFT_PANELS,
  currentRightPanelAtom,
} from "@/globals/workspace/layout";
import { themeAtom, tryUpdateThemeIfAutomaticAtom } from "@/globals/appearance";
import { saveAtom } from "@/globals/workspace/saving";
import { importCsvDatasetAtom } from "@/globals/workspace/datasets";

import WorkspaceProvider from "./WorkspaceProvider";
import Sidebar from "./Sidebar";
import AppMenubar from "./AppMenubar";
import AppStatusBar from "./AppStatusBar";
import { ToastProvider, useToast } from "@/components/Toast";
import { TooltipProvider } from "@/components/Tooltip";

import TimeCoursePanel from "./panels/simulation/TimeCoursePanel";
import ParameterScanPanel from "./panels/simulation/ParameterScanPanel";
import SteadyStatePanel from "./panels/simulation/SteadyStatePanel";
import DatasetsPanel from "./panels/datasets/DatasetPanel";

import HistoryPanel from "./panels/HistoryPanel";
import ExamplesPanel from "./panels/ExamplesPanel";

import EditorPanel from "./panels/EditorPanel";
import SlidersPanel from "./panels/sliders/SlidersPanel";

import ResultTabbedPanel from "./panels/results/ResultsTabbedPanel";
import PlotSettingsPanel from "./panels/PlotSettingsPanel";

const SAVE_INTERVAL = 60_000; // in ms

const getDefaultResultsPanelWidth = () => {
  if (window.matchMedia && window.matchMedia("(min-width: 2000px)").matches) {
    return 1000;
  } else {
    return 575;
  }
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const didIntialLoadRef = useRef(false);
  return (
    <ToastProvider>
      <TooltipProvider>
        <WorkspaceProvider didInitialLoadRef={didIntialLoadRef}>
          {children}
        </WorkspaceProvider>
      </TooltipProvider>
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
  const importCsvDataset = useSetAtom(importCsvDatasetAtom);

  const { toast } = useToast();

  const datasetInputRef = useRef<HTMLInputElement>(null);

  const handleDatasetFileOpen = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length < 0) {
      toast({
        type: "error",
        title: "No files imported",
        description: "None were selected.",
      });
      return;
    }

    for (const file of files) {
      const nameWithoutExtension = file.name.split(".")[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const result = importCsvDataset({
          name: nameWithoutExtension,
          csv: reader.result as string,
        });

        if (result.type === "error") {
          toast({
            type: "error",
            title: "Failed to import series",
            description: result.message,
          });
        }
      };
    }
  };

  return (
    <div className={styles.app}>
      <input
        style={{ display: "none" }}
        ref={datasetInputRef}
        type="file"
        onChange={handleDatasetFileOpen}
        accept=".csv"
      />

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
              <DatasetsPanel
                visible={currentLeftPanel === "Datasets"}
                onStartImport={() => {
                  const datasetInput = datasetInputRef.current;
                  if (datasetInput) {
                    datasetInput.value = "";
                    datasetInput.click();
                  }
                }}
              />
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
              preferredSize={getDefaultResultsPanelWidth()}
            >
              {currentRightPanel === "Results" && (
                <ResultTabbedPanel
                  onClose={() => setCurrentRightPanel(null)}
                  onStartDatasetImport={() => {
                    const datasetInput = datasetInputRef.current;
                    if (datasetInput) {
                      datasetInput.value = "";
                      datasetInput.click();
                      setCurrentLeftPanel("Datasets");
                    }
                  }}
                />
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

const ThemeUpdater = () => {
  const tryUpdateThemeIfAutomatic = useSetAtom(tryUpdateThemeIfAutomaticAtom);
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    const handleChange = () => {
      tryUpdateThemeIfAutomatic();
    };

    themeMediaQuery.addEventListener("change", handleChange);

    return () => themeMediaQuery.removeEventListener("change", handleChange);
  }, [tryUpdateThemeIfAutomatic]);

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return null;
};

const DataSaver = () => {
  const save = useSetAtom(saveAtom);

  useEffect(() => {
    const id = setInterval(() => {
      void save();
    }, SAVE_INTERVAL);

    return () => clearInterval(id);
  }, [save]);

  useEffect(() => {
    const handleUnload = () => {
      void save();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [save]);

  return null;
};

const App = () => {
  return (
    <AppProvider>
      <ThemeUpdater />
      <DataSaver />
      <AppContent />
    </AppProvider>
  );
};

export default App;
