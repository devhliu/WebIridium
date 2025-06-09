import { useState } from "react";
import styles from "./App.module.css";
import PanelLayout from "@/components/PanelLayout";
import Sidebar, { type SidebarTab } from "./Sidebar";
import TimeCoursePanel from "./panels/simulation/TimeCoursePanel";
import ParameterScanPanel from "./panels/simulation/ParameterScanPanel";
import AntimonyEditorPanel from "./panels/AntimonyEditorPanel";
import SteadyStatePanel from "./panels/simulation/SteadyStatePanel";
import PlotPanel from "./panels/results/PlotPanel";
import { WorkspaceProvider } from "@/features/workspace";

const App = () => {
  const [tab, setTab] = useState<SidebarTab>("TimeCourse");
  return (
    <WorkspaceProvider>
      <div className={styles.app}>
        <Sidebar
          tabs={["TimeCourse", "SteadyState", "ParameterScan"]}
          currentTab={tab}
          onTabChange={setTab}
        />
        <PanelLayout>
          {tab === "TimeCourse" && <TimeCoursePanel />}
          {tab === "ParameterScan" && <ParameterScanPanel />}
          {tab === "SteadyState" && <SteadyStatePanel />}
          <AntimonyEditorPanel />
          <PlotPanel />
        </PanelLayout>
      </div>
    </WorkspaceProvider>
  );
};

export default App;
