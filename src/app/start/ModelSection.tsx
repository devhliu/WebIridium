import { useAtomValue } from "jotai";
import { useState } from "react";

import styles from "./ModelSection.module.css";
import buttonStyles from "@/components/Button.module.css";

import ModelItem from "./ModelItem";
import PlusIcon from "@/assets/icons/PlusIcon.svg?react";
import PulseLoader from "@/components/PulseLoader";
import errorToDisplayString from "@/utils/errorToDisplayString";
import type { ModelId } from "@/features/savedData";
import { modelListAtom, useFileSystemActions } from "@/globals/files";

const ModelSection = () => {
  const modelList = useAtomValue(modelListAtom);
  const { createNewModel, openModel, promptModelFromFile, FileInput } =
    useFileSystemActions();

  const [openingModel, setOpeningModel] = useState<ModelId | null>(null);

  const handleSelectFor = (id: ModelId) => async () => {
    if (openingModel) return;

    setOpeningModel(id);
    await openModel(id);
    setOpeningModel(null);
  };

  return (
    <div className={styles.section}>
      <FileInput />
      <h3 className={styles.title}>
        My Models
        <div className={styles.modelActions}>
          <button
            className={buttonStyles.default}
            onClick={promptModelFromFile}
          >
            Open File
          </button>
          <button
            className={buttonStyles.primary}
            onClick={() => createNewModel()}
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
            <ModelItem
              key={id}
              metadata={metadata}
              isLoading={openingModel === id}
              onSelect={handleSelectFor(id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ModelSection;
