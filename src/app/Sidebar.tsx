// TODO: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

import styles from "./Sidebar.module.css";
import TimeCourseIcon from "@/assets/icons//TimeCourseIcon.svg?react";
import ParameterScanIcon from "@/assets/icons/ParameterScanIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";
import NotebookIcon from "@/assets/icons/NotebookIcon.svg?react";

export type SidebarTab =
  | "Time Course"
  | "Parameter Scan"
  | "Steady State"
  | "Examples";

const sidebarTabIcons: Record<
  SidebarTab,
  React.ComponentType<{ width: string; height: string }>
> = {
  "Time Course": TimeCourseIcon,
  "Parameter Scan": ParameterScanIcon,
  "Steady State": SteadyStateIcon,
  Examples: NotebookIcon,
} as const;

// these items appear on the top.
// every other item appears on the bottom
const topItems = new Set<SidebarTab>([
  "Time Course",
  "Parameter Scan",
  "Steady State",
]);

interface SidebarItemProps {
  tab: SidebarTab;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({ tab, isActive, onClick }: SidebarItemProps) => {
  const TabIcon = sidebarTabIcons[tab];
  return (
    <button
      className={styles.trigger}
      aria-label={tab}
      onClick={onClick}
      data-state={isActive ? "active" : "inactive"}
    >
      <TabIcon aria-hidden width="1em" height="1em" />
    </button>
  );
};

export interface SidebarProps {
  // TOOD: should this be moved out to some global constant?
  tabs: SidebarTab[];
  currentTab: SidebarTab | null;
  onTabChange: (tab: SidebarTab | null) => void;
}

const Sidebar = ({ tabs, currentTab, onTabChange }: SidebarProps) => {
  const handleTabClick = (tab: SidebarTab) => {
    if (currentTab === tab) {
      onTabChange(null);
    } else {
      onTabChange(tab);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {tabs
          .filter((t) => topItems.has(t))
          .map((tab) => (
            <SidebarItem
              key={tab}
              tab={tab}
              isActive={currentTab === tab}
              onClick={() => handleTabClick(tab)}
            />
          ))}
      </div>

      <div className={styles.list}>
        {tabs
          .filter((t) => !topItems.has(t))
          .map((tab) => (
            <SidebarItem
              key={tab}
              tab={tab}
              isActive={currentTab === tab}
              onClick={() => handleTabClick(tab)}
            />
          ))}
      </div>
    </div>
  );
};

export default Sidebar;
