import clsx from "clsx";

import styles from "./Dialog.module.css";

import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";

import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

export interface DialogProps {
  title: string;
  description: string;
  /* default: true */
  showDescription?: boolean;
  onClose: () => void;

  children: React.ReactNode;
  className?: string;
}

const Dialog = ({
  title,
  description,
  showDescription = true,
  onClose,
  children,
  className,
}: DialogProps) => {
  const descriptionElement = (
    <RadixDialog.Description className={styles.description}>
      {description}
    </RadixDialog.Description>
  );

  return (
    <RadixDialog.Root
      defaultOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content className={clsx(styles.dialog, className)}>
          <RadixDialog.Title className={styles.title}>
            {title}
          </RadixDialog.Title>
          {showDescription ? (
            descriptionElement
          ) : (
            <VisuallyHidden.Root>{descriptionElement}</VisuallyHidden.Root>
          )}

          <RadixDialog.Close className={styles.close}>
            <CrossIcon />
          </RadixDialog.Close>

          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Dialog;
