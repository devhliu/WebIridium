import styles from "./StartPanel.module.css";
import ModelSection from "./ModelSection.tsx";
import SearchSection from "./SearchSection.tsx";

const StartPanel = () => {
  return (
    <div className={styles.panel}>
      <ModelSection />
      <SearchSection />
    </div>
  );
};

export default StartPanel;
