import styles from "./PanelTitle.module.css";

export interface PanelTitleProps {
  title: string;
  children?: React.ReactNode;
}

const PanelTitle = ({ title, children }: PanelTitleProps) => {
  return (
    <div className={styles.titleSection}>
      <h2 className={styles.titleText}>{title}</h2>

      {children}
    </div>
  );
};

export default PanelTitle;
