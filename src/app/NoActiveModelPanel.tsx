import styles from "./NoActiveModelPanel.module.css";

const NoActiveModelPanel = () => {
  return (
    <div className={styles.panel}>
      <p className={styles.text}>No model open.</p>
    </div>
  );
};

export default NoActiveModelPanel;
