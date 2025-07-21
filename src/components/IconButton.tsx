import clsx from "clsx";

import styles from "./IconButton.module.css";

import Button from "./Button";

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
    <Button
      className={clsx(styles.iconButton, styles[size])}
      style="ghostText"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </Button>
  );
};

export default IconButton;
