import { useState } from "react";

import styles from "./ShareDialog.module.css";
import buttonStyles from "@/components/Button.module.css";
import { Dialog as RadixDialog } from "radix-ui";

import CrossIcon from "@/assets/icons/CrossIcon.svg?react";
import clsx from "clsx";

export interface ShareDialogProps {
  url: string;
  onClose: () => void;
}

const COPY_DEBOUNCE = 3000; // in ms

const ShareDialog = ({ url, onClose }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // TODO: handle failures?
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, COPY_DEBOUNCE);
  };

  return (
    <RadixDialog.Root
      defaultOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="overlay" />
        <RadixDialog.Content className={styles.content}>
          <RadixDialog.Title className={styles.title}>Share</RadixDialog.Title>
          <RadixDialog.Description className={styles.description}>
            Copy the link to share your model with others.
          </RadixDialog.Description>

          <RadixDialog.Close className={styles.close}>
            <CrossIcon />
          </RadixDialog.Close>

          <div className={styles.urlContainer}>
            <input
              className={styles.url}
              id="url-share-link"
              type="url"
              value={url}
              readOnly
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <button
              className={clsx(
                buttonStyles.default,
                copied && styles.copied,
                styles.copy,
              )}
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default ShareDialog;
