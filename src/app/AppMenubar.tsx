import styles from "./AppMenubar.module.css";
import {
  MenubarRoot,
  MenubarMenu,
  MenubarItem,
  MenubarRadioItem,
  MenubarRadioGroup,
} from "@/components/Menubar";
import type { SidebarTab } from "./Sidebar";

export interface AppMenubarProps {
  sidebarTab: SidebarTab;
  sidebarTabs: SidebarTab[];
  onSidebarTabChange: (newValue: SidebarTab) => void;
}

const AppMenubar = ({
  sidebarTab,
  sidebarTabs,
  onSidebarTabChange,
}: AppMenubarProps) => {
  return (
    <MenubarRoot className={styles.root}>
      <MenubarMenu name="File">
        <MenubarItem name="New" onSelect={() => null} />
        <MenubarItem name="Open..." onSelect={() => null} />
        <MenubarItem name="Save..." onSelect={() => null} />
      </MenubarMenu>

      <MenubarMenu name="View">
        <MenubarRadioGroup
          value={sidebarTab}
          onValueChange={onSidebarTabChange as (newValue: string) => void}
        >
          {sidebarTabs.map((tab) => (
            <MenubarRadioItem key={tab} value={tab}>
              {tab}
            </MenubarRadioItem>
          ))}
        </MenubarRadioGroup>
      </MenubarMenu>
    </MenubarRoot>
  );
};

export default AppMenubar;
