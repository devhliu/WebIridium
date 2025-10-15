import styles from "./globalSettings.module.css";

import GlobalSettingsPanel from "./GlobalSettingsPanel";
import Dialog from "@/components/Dialog";

export interface GlobalSettingsDialog {
  onClose: () => void;
}

const GlobalSettingsDialog = ({ onClose }: GlobalSettingsDialog) => {
  return (
    <Dialog
      title="Settings"
      description="Edit settings"
      showDescription={false}
      onClose={onClose}
      className={styles.dialog}
    >
      <div className={styles.panelContainer}>
        <GlobalSettingsPanel />
      </div>
    </Dialog>
  );
};

export default GlobalSettingsDialog;
