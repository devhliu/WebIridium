import { useState } from "react";
import { useAtom } from "jotai";

import styles from "./datasets.module.css";

import { datasetsAtom, type Dataset } from "@/globals/workspace/datasets";

import PanelTitle from "../PanelTitle";
import CancellableButton from "@/components/CancellableButton";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion.tsx";
import DatasetItem from "./DatasetItem.tsx";

import DownloadIcon from "@/assets/icons/DownloadIcon.svg?react";

export interface DatasetsPanelProps {
  visible: boolean;
  onStartImport: () => void;
}

const DatasetsPanel = ({ visible, onStartImport }: DatasetsPanelProps) => {
  const [datasets, setDatasets] = useAtom(datasetsAtom);

  const [closedDatasets, setClosedDatasets] = useState<string[]>([]);
  const openDatasets = datasets
    .filter((d) => !closedDatasets.includes(d.name))
    .map((d) => d.name);

  const handleOpenChange = (newOpen: string[]) => {
    setClosedDatasets(
      datasets.filter((d) => !newOpen.includes(d.name)).map((d) => d.name),
    );
  };

  const handleDatasetChange = (newDataset: Dataset) => {
    setDatasets((prev) =>
      prev.map((d) => (d.name === newDataset.name ? newDataset : d)),
    );
  };

  if (visible) {
    return (
      <div className={styles.panel}>
        <PanelTitle title="Datasets" />

        <CancellableButton onClick={onStartImport}>
          <DownloadIcon width="1em" height="1em" />
          Import Series
        </CancellableButton>

        <PropertyAccordion open={openDatasets} onOpenChange={handleOpenChange}>
          {datasets.length === 0 ? (
            <p className={styles.noDatasets}>No datasets</p>
          ) : (
            datasets.map((d) => (
              <DatasetItem
                key={d.name}
                dataset={d}
                onDatasetChange={handleDatasetChange}
              />
            ))
          )}
        </PropertyAccordion>
      </div>
    );
  } else {
    return null;
  }
};

export default DatasetsPanel;
