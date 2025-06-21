import styles from "./AppMenubar.module.css";
import { MenubarRoot, MenubarMenu, MenubarItem } from "@/components/Menubar";

export interface AppMenubarProps {}

const AppMenubar = ({}: AppMenubarProps) => {
  return (
    <MenubarRoot className={styles.root}>
      <MenubarMenu name="File">
        <MenubarItem name="New" onSelect={() => null} />
        <MenubarItem name="Open..." onSelect={() => null} />
        <MenubarItem name="Save..." onSelect={() => null} />
      </MenubarMenu>

      <MenubarMenu name="View">
        <MenubarItem name="Time Course Simulation" onSelect={() => null} />
        <MenubarItem name="Steady State" onSelect={() => null} />
        <MenubarItem name="Parameter Scan" onSelect={() => null} />
      </MenubarMenu>
    </MenubarRoot>
  );
};

export default AppMenubar;
