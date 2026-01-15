import styles from "./ModelItem.module.css";

import ThreeDotsIcon from "@/assets/icons/ThreeDotsIcon.svg?react";

export interface ModelItemProps {
  name: string;
}

const ModelItem = ({ name }: ModelItemProps) => {
  return (
    <div className={styles.item}>
      <button className={styles.main}>
        <div className={styles.icon}>
          <span className={styles.iconText}>{name[0].toUpperCase()}</span>
        </div>
        <div className={styles.details}>
          <h4 className={styles.name}>{name}</h4>
          <span className={styles.date}>Created: NN/NN/NN</span>
          <span className={styles.date}>Updated: NN/NN/NN</span>
        </div>
      </button>
      <div className={styles.moreContainer}>
        <button className={styles.more}>
          <ThreeDotsIcon className={styles.moreIcon} />
        </button>
      </div>
    </div>
  );
};

export default ModelItem;
