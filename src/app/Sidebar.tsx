// TODO: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

import styles from "./Sidebar.module.css";

import {
  SIDEBAR_TABS,
  TOP_SIDEBAR_TABS,
  currentSidebarTabAtom,
  type SidebarTab,
} from "@/globals/sidebar";

import TimeCourseIcon from "@/assets/icons//TimeCourseIcon.svg?react";
import ParameterScanIcon from "@/assets/icons/ParameterScanIcon.svg?react";
import SteadyStateIcon from "@/assets/icons/SteadyStateIcon.svg?react";
import NotebookIcon from "@/assets/icons/NotebookIcon.svg?react";
import { useAtom } from "jotai";

const sidebarTabIcons: Record<
  SidebarTab,
  React.ComponentType<{ width: string; height: string }>
> = {
  "Time Course": TimeCourseIcon,
  "Parameter Scan": ParameterScanIcon,
  "Steady State": SteadyStateIcon,
  Examples: NotebookIcon,

  // these don't really matter, just need it to typecheck
  "Plot Settings": NotebookIcon,
} as const;

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

const Sidebar = () => {
  const [currentTab, setCurrentTab] = useAtom(currentSidebarTabAtom);
  const handleTabClick = (tab: SidebarTab) => {
    if (currentTab === tab) {
      setCurrentTab(null);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {SIDEBAR_TABS.filter((t) => TOP_SIDEBAR_TABS.has(t)).map((tab) => (
          <SidebarItem
            key={tab}
            tab={tab}
            isActive={currentTab === tab}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </div>

      <div className={styles.list}>
        {SIDEBAR_TABS.filter((t) => !TOP_SIDEBAR_TABS.has(t)).map((tab) => (
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
