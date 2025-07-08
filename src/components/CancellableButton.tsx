import { clsx } from "clsx";
import styles from "./CancellableButton.module.css";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";
import PulseLoader from "./PulseLoader";

export interface ButtonProps {
  /** An icon that appears next to the button. */
  icon?: React.ReactNode;

  onClick?: () => void;

  /** A button that is loading will have its content replaced with a spinner. */
  isLoading?: boolean;

  /**
   * When a button in cancellable, an 'x' will appear to the right of it
   * which can be clicked to call the `onCancel` function
   */
  canCancel?: boolean;
  onCancel?: () => void;

  children?: React.ReactNode;
}

const CancellableButton = ({
  icon,
  onClick,
  isLoading = false,
  canCancel = false,
  onCancel,
  children,
}: ButtonProps) => {
  return (
    <span className={clsx(styles.container, isLoading && styles.disabled)}>
      <button
        className={clsx(
          styles.main,
          styles.primary,
          canCancel && styles.hasSiblingCancel,
        )}
        onClick={onClick}
        disabled={isLoading}
        aria-label={isLoading ? "Loading" : undefined}
      >
        {isLoading ? (
          <PulseLoader aria-hidden="true" color="var(--button-foreground)" />
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>

      {canCancel && (
        <button
          className={clsx(styles.cancel, styles.primary)}
          aria-label="Cancel"
          onClick={onCancel}
        >
          <CrossIcon />
        </button>
      )}
    </span>
  );
};

export default CancellableButton;
