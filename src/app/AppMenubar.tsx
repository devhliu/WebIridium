import { useRef } from "react";
import { useAtomValue } from "jotai";
import styles from "./AppMenubar.module.css";

import {
  MenubarRoot,
  MenubarMenu,
  MenubarItem,
  MenubarRadioItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarSeparator,
} from "@/components/Menubar";
import type { SidebarTab } from "./Sidebar";
import { useToast } from "@/components/Toast";
import WorkspaceBar from "./WorkspaceBar";

import { promptDownloadFile } from "@/features/promptDownloadFile";
import { getTheme, setTheme } from "@/features/theme";
import { nameAtom } from "@/globals/workspace/settings";
import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";
import { useSetAtom } from "jotai";

export interface AppMenubarProps {
  sidebarTab: SidebarTab | null;
  sidebarTabs: SidebarTab[];
  onSidebarTabChange: (newValue: SidebarTab) => void;

  slidersPanelActive: boolean;
  onSlidersPanelToggle: (on: boolean) => void;
}

const AppMenubar = ({
  sidebarTab,
  sidebarTabs,
  onSidebarTabChange,

  slidersPanelActive,
  onSlidersPanelToggle,
}: AppMenubarProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const workspaceName = useAtomValue(nameAtom);

  const handleDownload = () => {
    promptDownloadFile(`${workspaceName}.ant`, editorContent, "ant");
  };

  const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length !== 1) {
      toast({
        type: "error",
        title: "File open failed",
        description: "A single file must be selected",
      });
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      void updateEditorContent({ content: reader.result as string });
    };
  };

  return (
    <div className={styles.root}>
      <input
        style={{ display: "none" }}
        ref={fileInputRef}
        type="file"
        onChange={handleFileOpen}
        accept=".ant,.txt"
      />

      <MenubarRoot className={styles.menubarLeft}>
        <MenubarMenu name="File">
          <MenubarItem name="New" onSelect={() => null} />
          <MenubarItem
            name="Open..."
            onSelect={() => {
              fileInputRef.current?.click();
            }}
          />
          <MenubarItem name="Download" onSelect={handleDownload} />
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

          <MenubarSeparator />

          <MenubarCheckboxItem
            checked={slidersPanelActive}
            onCheckedChange={onSlidersPanelToggle}
          >
            Sliders
          </MenubarCheckboxItem>

          <MenubarSeparator />

          <MenubarItem
            name="toggle theme (TEMPORARY)"
            onSelect={() => {
              if (getTheme() === "dark")
                setTheme("light", { applyTransition: true });
              else setTheme("dark", { applyTransition: true });
            }}
          />
        </MenubarMenu>
      </MenubarRoot>

      <div className={styles.menubarCenter}>
        <WorkspaceBar />
      </div>

      <div className={styles.menubarRight}>{/* empty for now */}</div>
    </div>
  );
};

export default AppMenubar;
