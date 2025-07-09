import clsx from "clsx";
import styles from "./Button.module.css";

export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button = ({
  onClick,
  disabled = false,
  children,
  className,
}: ButtonProps) => {
  return (
    <button
      className={clsx(styles.button, className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
