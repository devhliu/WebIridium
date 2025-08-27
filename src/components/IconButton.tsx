import clsx from "clsx";

import buttonStyles from "./Button.module.css";
import styles from "./IconButton.module.css";

import { Tooltip } from "./Tooltip";

export interface IconButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** default is "normal" */
  size?: "normal" | "small";
  children: React.ReactNode;
}

const IconButton = ({
  label,
  onClick,
  disabled = false,
  size = "normal",
  children,
}: IconButtonProps) => {
  return (
    <Tooltip text={label}>
      <button
        className={clsx(
          buttonStyles.ghostText,
          styles.iconButton,
          styles[size],
        )}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default IconButton;
