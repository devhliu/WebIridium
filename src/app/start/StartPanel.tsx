import { useSetAtom } from "jotai";
import styles from "./StartPanel.module.css";
import buttonStyles from "@/components/Button.module.css";
import { setModelAtom } from "@/globals/model";

import defaultModel from "@/assets/default.ant?raw";
import { ModelItem } from "./ModelItem";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";

const BiomodelItem = () => {
  return (
    <div>
      <h4>Biomodel Name (BIOMD0000123)</h4>
      <p>Person Name, Person Name - Journal, Year</p>
      <a href="">https://www.ebi.aci.uk/biomodels/BIOMD0000123</a>
    </div>
  );
};

export interface StartPanelProps {}

export const StartPanel = () => {
  const setModel = useSetAtom(setModelAtom);
  const handleNewModel = () => {
    setModel({
      name: "Default Model",
      content: defaultModel,
    });
  };

  return (
    <div className={styles.panel}>
      <div>
        <div>
          <h3 className={styles.modelsTitle}>
            Models
            <div className={styles.modelActions}>
              <button className={buttonStyles.default}>Open File</button>
              <button className={buttonStyles.primary} onClick={handleNewModel}>
                <PlusIcon width="1em" height="1em" />
                New Model
              </button>
            </div>
          </h3>
          <div className={styles.modelList}>
            <ModelItem name="test model" />
            <ModelItem name="test model" />
            <ModelItem name="test model" />
            <ModelItem name="test model" />
          </div>
        </div>
      </div>
    </div>
  );
};
