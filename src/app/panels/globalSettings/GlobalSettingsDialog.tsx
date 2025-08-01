import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";

import styles from "./globalSettings.module.css";

import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

import GlobalSettingsPanel from "./GlobalSettingsPanel";

export interface GlobalSettingsDialog {
  onClose: () => void;
}

const GlobalSettingsDialog = ({ onClose }: GlobalSettingsDialog) => {
  return (
    <RadixDialog.Root
      defaultOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="overlay" />
        <RadixDialog.Content className={styles.dialog}>
          <RadixDialog.Title className={styles.title}>
            Settings
          </RadixDialog.Title>
          <RadixDialog.Close className={styles.close}>
            <CrossIcon />
          </RadixDialog.Close>
          <VisuallyHidden.Root asChild>
            <RadixDialog.Description className={styles.description}>
              Edit settings
            </RadixDialog.Description>
          </VisuallyHidden.Root>

          <div className={styles.panelContainer}>
            <GlobalSettingsPanel />
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default GlobalSettingsDialog;
