import { useRef } from "react";
import styles from "./AppMenubar.module.css";
import {
  MenubarRoot,
  MenubarMenu,
  MenubarItem,
  MenubarRadioItem,
  MenubarRadioGroup,
  MenubarSeparator,
} from "@/components/Menubar";
import type { SidebarTab } from "./Sidebar";
import { useToast } from "@/components/Toast";
import { useEditorContent } from "@/features/editorContent";
import { promptDownloadFile } from "@/features/promptDownloadFile";

import { getTheme, setTheme } from "@/features/theme";

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { editorContent, setEditorContent } = useEditorContent();

  const handleDownload = () => {
    promptDownloadFile("test.ant", editorContent.value, "ant");
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
      void setEditorContent(reader.result as string);
    };
  };

  return (
    <MenubarRoot className={styles.root}>
      <input
        style={{ display: "none" }}
        ref={fileInputRef}
        type="file"
        onChange={handleFileOpen}
        accept=".ant,.txt"
      />

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
        <MenubarItem
          name="toggle theme (TEMPORARY)"
          onSelect={() => {
            if (getTheme() === "dark") setTheme("light");
            else setTheme("dark");
          }}
        />
      </MenubarMenu>
    </MenubarRoot>
  );
};

export default AppMenubar;
