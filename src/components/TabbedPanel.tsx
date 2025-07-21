import { useState } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import styles from "./TabbedPanel.module.css";

export interface TabInfo {
  name: string;
  icon?: React.ReactNode;
  render: () => React.ReactNode;
  renderActions?: () => React.ReactNode;
}

export interface TabbedPanelProps {
  tabs: TabInfo[];
  ["data-testid"]?: string;
}

const TabbedPanel = ({ tabs, "data-testid": testId }: TabbedPanelProps) => {
  const [tab, setTab] = useState(tabs[0].name);
  const currentTabInfo = tabs.find((t) => t.name === tab);
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (!currentTabInfo) {
    setTab(tabs[0].name);
    return;
  }

  return (
    <div className={styles.panel} data-testid={testId}>
      <RadixTabs.Root
        className={styles.tabRoot}
        value={tab}
        onValueChange={setTab}
      >
        <div className={styles.topList}>
          <RadixTabs.List className={styles.tabList}>
            {tabs.map((tabInfo) => (
              <RadixTabs.Trigger
                key={tabInfo.name}
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

          <div className={styles.actionList}>
            {currentTabInfo.renderActions && currentTabInfo.renderActions()}
          </div>
        </div>
      </RadixTabs.Root>

      <div className={styles.body}>{currentTabInfo.render()}</div>
    </div>
  );
};

export default TabbedPanel;
