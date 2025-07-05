import clsx from "clsx";
import styles from "./StatusBar.module.css";

export interface StatusBarProps {
  children: React.ReactNode;
}

export const StatusBar = ({ children }: StatusBarProps) => {
  return <div className={styles.root}>{children}</div>;
};

export interface StatusBarItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StatusBarItem = ({ children, className }: StatusBarItemProps) => {
  return <div className={clsx(styles.item, className)}>{children}</div>;
};
