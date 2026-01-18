import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import styles from "./AppMenubar.module.css";

import {
  MenubarRoot,
  MenubarMenu,
  MenubarItem,
  MenubarLinkItem,
  MenubarRadioItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarSeparator,
} from "@/components/Menubar";

import {
  currentLeftPanelAtom,
  currentRightPanelAtom,
  currentBottomPanelAtom,
  availableLeftPanelsAtom,
  ALL_LEFT_PANELS,
} from "@/globals/layout";

import { useToast } from "@/components/Toast";
import SearchBar from "./SearchBar";
import GlobalSettingsDialog from "./globalSettings/GlobalSettingsDialog";
import HelpDialog from "./HelpDialog";
import AboutDialog from "./AboutDialog";

import { convertAntimonyToSbml } from "@/features/antimony";
import { promptDownloadString } from "@/features/download";
import { nameAtom } from "@/globals/settings";
import { editorContentAtom } from "@/globals/model";
import { hasActiveProjectAtom, useProjectActions } from "@/globals/project";

const AppMenubar = () => {
  const { toast } = useToast();

  const editorContent = useAtomValue(editorContentAtom);
  const workspaceName = useAtomValue(nameAtom);
  const hasActiveProject = useAtomValue(hasActiveProjectAtom);

  const availableLeftPanels = useAtomValue(availableLeftPanelsAtom);
  const [currentLeftPanel, setCurrentLeftPanel] = useAtom(currentLeftPanelAtom);
  const [currentRightPanel, setCurrentRightPanel] = useAtom(
    currentRightPanelAtom,
  );
  const [currentBottomPanel, setCurrentBottomPanel] = useAtom(
    currentBottomPanelAtom,
  );

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);

  const {
    createNewProject,
    promptProjectFromFile,
    closeCurrentProject,
    FileInput,
  } = useProjectActions();

  const handleDownloadAntimony = () => {
    promptDownloadString(`${workspaceName}.ant`, editorContent, "ant");
  };

  const handleDownloadSbml = async () => {
    try {
      const sbml = await convertAntimonyToSbml(editorContent);
      promptDownloadString(`${workspaceName}.xml`, sbml, "xml");
    } catch (e) {
      if (e instanceof Error) {
        toast({
          type: "error",
          title: "Error converting Antimony to SBML",
          description: e.message,
        });
      }
    }
  };

  return (
    <div className={styles.root}>
      <FileInput />

      {isSettingsOpen && (
        <GlobalSettingsDialog onClose={() => setSettingsOpen(false)} />
      )}

      {isHelpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}

      {isAboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}

      <MenubarRoot className={styles.menubarLeft}>
        <MenubarMenu name="File">
          <MenubarItem name="New Project" onSelect={() => createNewProject()} />
          <MenubarItem
            name="Import File..."
            onSelect={() => promptProjectFromFile()}
          />
          <MenubarItem
            name="Download as Antimony"
            onSelect={handleDownloadAntimony}
            disabled={!hasActiveProject}
          />
          <MenubarItem
            name="Download as SBML"
            disabled={!hasActiveProject}
            onSelect={handleDownloadSbml}
          />
          <MenubarSeparator />
          <MenubarItem
            name="Close Project"
            disabled={!hasActiveProject}
            onSelect={closeCurrentProject}
          />
        </MenubarMenu>

        <MenubarMenu name="View">
          <MenubarRadioGroup
            value={currentLeftPanel}
            onValueChange={setCurrentLeftPanel as (newValue: string) => void}
          >
            {ALL_LEFT_PANELS.map((panel) => (
              <MenubarRadioItem
                key={panel}
                value={panel}
                disabled={!availableLeftPanels.includes(panel)}
              >
                {panel}
              </MenubarRadioItem>
            ))}
          </MenubarRadioGroup>

          <MenubarSeparator />

          <MenubarCheckboxItem
            checked={currentBottomPanel === "Sliders"}
            onCheckedChange={(checked) =>
              checked
                ? setCurrentBottomPanel("Sliders")
                : setCurrentBottomPanel(null)
            }
            disabled={!hasActiveProject}
          >
            Sliders
          </MenubarCheckboxItem>

          <MenubarCheckboxItem
            checked={currentRightPanel === "Results"}
            onCheckedChange={(checked) =>
              checked
                ? setCurrentRightPanel("Results")
                : setCurrentRightPanel(null)
            }
          >
            Results
          </MenubarCheckboxItem>

          <MenubarSeparator />

          <MenubarItem name="Settings" onSelect={() => setSettingsOpen(true)} />
        </MenubarMenu>

        <MenubarMenu name="Help">
          <MenubarItem name="Help" onSelect={() => setHelpOpen(true)} />
          <MenubarLinkItem
            name="Antimony Reference"
            href="https://tellurium.readthedocs.io/en/latest/antimony.html"
          />
          <MenubarLinkItem
            name="GitHub"
            href="https://github.com/sys-bio/WebIridium"
          />
          <MenubarItem name="About" onSelect={() => setAboutOpen(true)} />
        </MenubarMenu>
      </MenubarRoot>

      <div className={styles.menubarCenter}>
        {hasActiveProject && <SearchBar />}
      </div>

      <div className={styles.menubarRight}></div>
    </div>
  );
};

export default AppMenubar;
