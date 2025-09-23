import { useRef, useState } from "react";
import { useSetAtom, useAtom } from "jotai";

import styles from "./datasets.module.css";

import {
  datasetsAtom,
  importCsvDatasetAtom,
  type Dataset,
} from "@/globals/workspace/datasets";

import { useToast } from "@/components/Toast";
import PanelTitle from "../PanelTitle";
import CancellableButton from "@/components/CancellableButton";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion.tsx";
import DatasetItem from "./DatasetItem.tsx";

import DownloadIcon from "@/assets/icons/DownloadIcon.svg?react";

const DatasetsPanel = () => {
  const [datasets, setDatasets] = useAtom(datasetsAtom);
  const importCsvDataset = useSetAtom(importCsvDatasetAtom);

  const [openDatasets, setOpenDatasets] = useState<string[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    const fileInput = fileInputRef.current;
    if (fileInput) {
      fileInput.value = "";
      fileInput.click();
    }
  };

  const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length < 0) {
      toast({
        type: "error",
        title: "No files imported",
        description: "None were selected.",
      });
      return;
    }

    for (const file of files) {
      const nameWithoutExtension = file.name.split(".")[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const result = importCsvDataset({
          name: nameWithoutExtension,
          csv: reader.result as string,
        });

        if (result.type === "success") {
          setOpenDatasets((prev) => [...prev, result.dataset.name]);
        } else if (result.type === "error") {
          toast({
            type: "error",
            title: "Failed to import series",
            description: result.message,
          });
        }
      };
    }
  };

  const handleDatasetChange = (newDataset: Dataset) => {
    setDatasets((prev) =>
      prev.map((d) => (d.name === newDataset.name ? newDataset : d)),
    );
  };

  return (
    <div className={styles.panel}>
      <input
        style={{ display: "none" }}
        ref={fileInputRef}
        type="file"
        onChange={handleFileOpen}
        accept=".csv"
      />

      <PanelTitle title="Datasets" />

      <CancellableButton onClick={handleImport}>
        <DownloadIcon width="1em" height="1em" />
        Import Series
      </CancellableButton>

      <PropertyAccordion open={openDatasets} onOpenChange={setOpenDatasets}>
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
};

export default DatasetsPanel;
