import styles from "./ModelSection.module.css";
import buttonStyles from "@/components/Button.module.css";

import ModelItem from "./ModelItem";

import { useModelList } from "@/features/fileSystem";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";

const ModelSection = () => {
  const { models } = useModelList();

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        My Models
        <div className={styles.modelActions}>
          <button className={buttonStyles.default}>Open File</button>
          <button className={buttonStyles.primary}>
            <PlusIcon width="1em" height="1em" />
            New Model
          </button>
        </div>
      </h3>
      <div className={styles.modelList}>
        {models.size === 0 ? (
          <p className={styles.noModels}>You have no models.</p>
        ) : (
          Array.from(models.entries()).map(([id, metadata]) => (
            <ModelItem key={id} name={metadata.name} />
          ))
        )}
      </div>
    </div>
  );
};

export default ModelSection;
