import styles from "./StartPanel.module.css";
import ModelSection from "./ModelSection.tsx";
import SearchSection from "./SearchSection.tsx";

export interface StartPanelProps {}

const StartPanel = () => {
  return (
    <div className={styles.panel}>
      <ModelSection />
      <SearchSection />
    </div>
  );
};

export default StartPanel;
