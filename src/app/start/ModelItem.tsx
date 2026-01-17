import type { Metadata } from "@/features/savedData";
import styles from "./ModelItem.module.css";

import ThreeDotsIcon from "@/assets/icons/ThreeDotsIcon.svg?react";
import { timestampToNumericDate } from "@/features/formatUtils";

export interface ModelItemProps {
  metadata: Metadata;
  onSelect: () => void;
}

const ModelItem = ({ metadata, onSelect }: ModelItemProps) => {
  return (
    <div className={styles.item}>
      <button className={styles.main} onClick={onSelect}>
        <div className={styles.icon}>
          <span className={styles.iconText}>
            {metadata.name[0].toUpperCase()}
          </span>
        </div>
        <div className={styles.details}>
          <h4 className={styles.name}>{metadata.name}</h4>
          <span className={styles.date}>
            Created: {timestampToNumericDate(metadata.created)}
          </span>
          <span className={styles.date}>
            Updated: {timestampToNumericDate(metadata.updated)}
          </span>
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
