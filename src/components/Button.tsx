import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonStyle = "default" | "ghost" | "ghostText";

export interface ButtonProps {
  style?: ButtonStyle;
  onClick?: () => void;
  disabled?: boolean;
  iconOnly?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button = ({
  style = "default",
  onClick,
  disabled = false,
  iconOnly,
  children,
  className,
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        styles[style],
        disabled && styles.disabled,
        iconOnly && styles.iconOnly,
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
