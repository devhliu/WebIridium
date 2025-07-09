import styles from "./ExamplesPanel.module.css";
import PanelTitle from "./PanelTitle";

export interface ExamplesPanelProps {}

const ExamplesPanel = () => {
  return (
    <div className={styles.panel}>
      <PanelTitle title="Examples" />
    </div>
  );
};

export default ExamplesPanel;
