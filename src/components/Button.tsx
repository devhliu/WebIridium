import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonStyle = "default" | "ghost";

export interface ButtonProps {
  style?: ButtonStyle;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button = ({
  style = "default",
  onClick,
  disabled = false,
  children,
  className,
}: ButtonProps) => {
  return (
    <button
      className={clsx(styles[style], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
