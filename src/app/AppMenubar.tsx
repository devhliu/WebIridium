import { useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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

import { SIDEBAR_TABS, currentSidebarTabAtom } from "@/globals/sidebar";

import { useToast } from "@/components/Toast";
import WorkspaceBar from "./WorkspaceBar";
import ShareButton from "./ShareButton";

import { promptDownloadFile } from "@/features/promptDownloadFile";
import { toggleThemeAtom } from "@/globals/theme";
import { nameAtom } from "@/globals/workspace/settings";
import {
  editorContentAtom,
  updateEditorContentAtom,
} from "@/globals/workspace/model";

export interface AppMenubarProps {
  slidersPanelActive: boolean;
  onSlidersPanelToggle: (on: boolean) => void;
}

const AppMenubar = ({
  slidersPanelActive,
  onSlidersPanelToggle,
}: AppMenubarProps) => {
  const { toast } = useToast();
  const editorContent = useAtomValue(editorContentAtom);
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const toggleTheme = useSetAtom(toggleThemeAtom);
  const workspaceName = useAtomValue(nameAtom);
  const [sidebarTab, setSidebarTab] = useAtom(currentSidebarTabAtom);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            onValueChange={setSidebarTab as (newValue: string) => void}
          >
            {SIDEBAR_TABS.map((tab) => (
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

          <MenubarItem name="toggle theme (TEMPORARY)" onSelect={toggleTheme} />
        </MenubarMenu>
      </MenubarRoot>

      <div className={styles.menubarCenter}>
        <WorkspaceBar />
      </div>

      <div className={styles.menubarRight}>
        <ShareButton />
      </div>
    </div>
  );
};

export default AppMenubar;
