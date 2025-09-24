import { useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";

import styles from "./overlays.module.css";

import {
  datasetsAtom,
  importCsvDatasetAtom,
  type Dataset,
} from "@/globals/workspace/overlays";

import { useToast } from "@/components/Toast.tsx";
import PanelTitle from "../PanelTitle";
import IconButton from "@/components/IconButton.tsx";
import CancellableButton from "@/components/CancellableButton";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion.tsx";
import DatasetItem from "./DatasetItem.tsx";

import DownloadIcon from "@/assets/icons/DownloadIcon.svg?react";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

export interface OverlaysPanelProps {
  onClose: () => void;
}

const OverlaysPanel = ({ onClose }: OverlaysPanelProps) => {
  const [datasets, setDatasets] = useAtom(datasetsAtom);
  const importCsvDataset = useSetAtom(importCsvDatasetAtom);

  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [closedDatasets, setClosedDatasets] = useState<string[]>([]);
  const openDatasets = datasets
    .filter((d) => !closedDatasets.includes(d.name))
    .map((d) => d.name);

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

        if (result.type === "error") {
          toast({
            type: "error",
            title: "Failed to import series",
            description: result.message,
          });
        }
      };
    }
  };

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

  return (
    <div className={styles.panel}>
      <input
        style={{ display: "none" }}
        ref={fileInputRef}
        type="file"
        onChange={handleFileOpen}
        accept=".csv"
      />
      <PanelTitle title="Overlays">
        <IconButton onClick={onClose} label="Close">
          <CrossIcon width="1em" height="1em" aria-hidden />
        </IconButton>
      </PanelTitle>

      <CancellableButton
        onClick={() => {
          const fileInput = fileInputRef.current;
          if (fileInput) {
            fileInput.value = "";
            fileInput.click();
          }
        }}
      >
        <DownloadIcon width="1em" height="1em" />
        Import Series
      </CancellableButton>

      <PropertyAccordion open={openDatasets} onOpenChange={handleOpenChange}>
        {datasets.length === 0 ? (
          <p className={styles.noOverlays}>No overlays</p>
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

export default OverlaysPanel;
