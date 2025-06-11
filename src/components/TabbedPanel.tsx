import { useState } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import styles from "./TabbedPanel.module.css";

export interface TabInfo {
  name: string;
  icon?: React.ReactNode;
  render: () => React.ReactNode;
}

export interface TabbedPanelProps {
  tabs: TabInfo[];
}

const TabbedPanel = ({ tabs }: TabbedPanelProps) => {
  const [tab, setTab] = useState(tabs[0].name);

  return (
    <div className={styles.panel}>
      <RadixTabs.Root
        className={styles.tabRoot}
        value={tab}
        onValueChange={setTab}
      >
        <RadixTabs.List className={styles.tabList}>
          {tabs.map((tabInfo) => (
            <RadixTabs.Trigger
              className={styles.tabTrigger}
              value={tabInfo.name}
            >
              {tabInfo.icon && (
                <span className={styles.tabIcon}>{tabInfo.icon}</span>
              )}
              {tabInfo.name}
            </RadixTabs.Trigger>
          ))}
        </RadixTabs.List>
      </RadixTabs.Root>

      <div className={styles.body}>
        {tabs.find((t) => t.name === tab)!.render()}
      </div>
    </div>
  );
};

export default TabbedPanel;
