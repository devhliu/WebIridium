import { useState } from "react";
import clsx from "clsx";

import styles from "./ShareDialog.module.css";
import buttonStyles from "@/components/Button.module.css";

import Dialog from "@/components/Dialog";

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
    <Dialog
      title="Share"
      description="Copy the link to share your model with others."
      onClose={onClose}
    >
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
    </Dialog>
  );
};

export default ShareDialog;
