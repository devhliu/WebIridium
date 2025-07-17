import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonStyle = "default" | "ghost" | "ghostText";

export interface ButtonProps {
  style?: ButtonStyle;
  onClick?: () => void;
  disabled?: boolean;
  /* this makes the aspect ratio square and the font-size larger */
  iconOnly?: boolean;
  /** this makes it look like its being hovered. TODO: rename this to "focused"? */
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLButtonElement | null>;
}

const Button = ({
  style = "default",
  onClick,
  disabled = false,
  iconOnly,
  active = false,
  children,
  className,
  ref,
}: ButtonProps) => {
  return (
    <button
      ref={ref}
      className={clsx(
        styles[style],
        styles.base,
        iconOnly && styles.iconOnly,
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      data-active={active}
    >
      {children}
    </button>
  );
};

export default Button;
