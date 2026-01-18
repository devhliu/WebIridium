import type { Metadata } from "@/features/projectData";
import styles from "./ModelItem.module.css";

import ThreeDotsIcon from "@/assets/icons/ThreeDotsIcon.svg?react";
import { timestampToNumericDate } from "@/features/formatUtils";
import { getPropertyFromCssGradient } from "@/features/cssGradients";
import PulseLoader from "@/components/PulseLoader";

export interface ModelItemProps {
  metadata: Metadata;
  isLoading: boolean;
  onSelect: () => void;
}

const getIconTextFromName = (name: string) => {
  const words = name.split(" ").filter((w) => w[0]?.match(/[a-zA-Z]/g));
  if (words.length === 0) {
    return "M";
  } else if (1 <= words.length && words.length <= 3) {
    return words[0][0].toUpperCase();
  } else {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }
};

const ModelItem = ({ metadata, isLoading, onSelect }: ModelItemProps) => {
  return (
    <div className={styles.item}>
      <button className={styles.main} disabled={isLoading} onClick={onSelect}>
        <div
          className={styles.icon}
          style={{
            background: getPropertyFromCssGradient(metadata.icon.color),
          }}
        >
          <span className={styles.iconText}>
            {getIconTextFromName(metadata.name)}
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
          {isLoading ? (
            <PulseLoader size="0.3rem" />
          ) : (
            <ThreeDotsIcon className={styles.moreIcon} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ModelItem;
