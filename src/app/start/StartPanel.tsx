import styles from "./StartPanel.module.css";
import { ModelSection } from "./ModelSection.tsx";
import { SearchSection } from "./SearchSection.tsx";

export interface StartPanelProps {}

export const StartPanel = () => {
  return (
    <div className={styles.panel}>
      <ModelSection />
      <SearchSection />
    </div>
  );
};
