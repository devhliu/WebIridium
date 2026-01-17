import { useAtomValue } from "jotai";

import styles from "./ModelSection.module.css";
import buttonStyles from "@/components/Button.module.css";

import ModelItem from "./ModelItem";
import PlusIcon from "@/assets/icons/PlusIcon.svg?react";
import { modelListAtom, useFileSystemActions } from "@/globals/files";
import PulseLoader from "@/components/PulseLoader";
import errorToDisplayString from "@/utils/errorToDisplayString";

const ModelSection = () => {
  const modelList = useAtomValue(modelListAtom);
  const { createAndOpenNewFile } = useFileSystemActions();

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        My Models
        <div className={styles.modelActions}>
          <button className={buttonStyles.default}>Open File</button>
          <button
            className={buttonStyles.primary}
            onClick={() => createAndOpenNewFile()}
          >
            <PlusIcon width="1em" height="1em" />
            New Model
          </button>
        </div>
      </h3>
      <div className={styles.modelList}>
        {modelList.state === "loading" ? (
          <div className={styles.loaderContainer}>
            <PulseLoader />
          </div>
        ) : modelList.state === "hasError" ? (
          <p className={styles.error}>
            Error: {errorToDisplayString(modelList.error)}
          </p>
        ) : modelList.data.size === 0 ? (
          <p className={styles.error}>You have no models.</p>
        ) : (
          Array.from(modelList.data.entries()).map(([id, metadata]) => (
            <ModelItem key={id} name={metadata.name} />
          ))
        )}
      </div>
    </div>
  );
};

export default ModelSection;
