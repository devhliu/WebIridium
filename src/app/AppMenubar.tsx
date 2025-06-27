import { useRef } from "react";
import styles from "./AppMenubar.module.css";
import {
  MenubarRoot,
  MenubarMenu,
  MenubarItem,
  MenubarRadioItem,
  MenubarRadioGroup,
} from "@/components/Menubar";
import type { SidebarTab } from "./Sidebar";
import { useToast } from "@/components/Toast";
import { useEditorContent } from "@/features/editorContent";

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
  const { setEditorContent } = useEditorContent();

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
