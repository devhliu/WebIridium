import { useFileSystemActions } from "@/globals/files";
import styles from "./NoActiveModelPanel.module.css";
import buttonStyles from "@/components/Button.module.css";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";

const NoActiveModelPanel = () => {
  const { createNewModel } = useFileSystemActions();

  return (
    <div className={styles.panel}>
      <p className={styles.text}>No model open.</p>
      <button className={buttonStyles.primary} onClick={() => createNewModel()}>
        <PlusIcon aria-hidden width="1em" height="1em" />
        New Model
      </button>
    </div>
  );
};

export default NoActiveModelPanel;
