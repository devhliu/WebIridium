import { useState } from "react";
import styles from "./App.module.css";
import GraphIcon from "@/assets/icons/GraphIcon.svg?react";
import TableIcon from "@/assets/icons/TableIcon.svg?react";
import PanelLayout from "@/components/PanelLayout";
import Sidebar, { type SidebarTab } from "./Sidebar";
import TimeCoursePanel from "./panels/simulation/TimeCoursePanel";
import ParameterScanPanel from "./panels/simulation/ParameterScanPanel";
import AntimonyEditorPanel from "./panels/AntimonyEditorPanel";
import SteadyStatePanel from "./panels/simulation/SteadyStatePanel";
import PlotPanel from "./panels/results/PlotPanel";
import { WorkspaceProvider } from "@/features/workspace";
import TabbedPanel from "@/components/TabbedPanel";

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
          <TimeCoursePanel visible={tab === "TimeCourse"} />
          <ParameterScanPanel visible={tab === "ParameterScan"} />
          <SteadyStatePanel visible={tab === "SteadyState"} />
          <AntimonyEditorPanel />
          <TabbedPanel
            tabs={[
              {
                name: "Plot",
                icon: <GraphIcon width="20" height="20" />,
                render: () => <PlotPanel />,
              },
              {
                name: "Table",
                icon: <TableIcon width="20" height="20" />,
                render: () => <div />,
              },
            ]}
          />
        </PanelLayout>
      </div>
    </WorkspaceProvider>
  );
};

export default App;
