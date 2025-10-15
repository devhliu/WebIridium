import styles from "./overlays.module.css";

import type { Dataset, DatasetVariable } from "@/globals/workspace/overlays";

import DatasetVariableItem from "./DatasetVariableItem";

import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import PropertyList from "@/components/property-list/PropertyList";
import SelectProperty from "@/components/property-list/SelectProperty";
import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";

export interface DatasetItemProps {
  dataset: Dataset;
  onDatasetChange: (newDataset: Dataset) => void;
}

const DatasetItem = ({ dataset, onDatasetChange }: DatasetItemProps) => {
  const handleVariableChange = (newVariable: DatasetVariable) => {
    onDatasetChange({
      ...dataset,
      variables: {
        ...dataset.variables,
        [newVariable.name]: newVariable,
      },
    });
  };

  return (
    <PropertyAccordionItem title={dataset.name}>
      <div className={styles.itemContent}>
        <PropertyList alignment="leftSmall">
          <BooleanProperty
            name="Enabled"
            onChange={(newValue) =>
              onDatasetChange({
                ...dataset,
                enabled: newValue,
              })
            }
            value={dataset.enabled}
          />
          <SelectProperty
            name="Independent Variable"
            onChange={(newValue) =>
              onDatasetChange({
                ...dataset,
                independentVariableName: newValue,
              })
            }
            value={dataset.independentVariableName}
            options={Object.fromEntries(
              Object.values(dataset.variables).map((v) => [
                v.displayName,
                v.name,
              ]),
            )}
          />
          <NumericSliderProperty
            name="Size"
            value={dataset.size}
            onChange={(newSize: number) =>
              onDatasetChange({
                ...dataset,
                size: newSize,
              })
            }
            min={1}
            max={100}
            step={1}
          />
        </PropertyList>

        <div className={styles.variableList}>
          {Object.values(dataset.variables).map((v) => (
            <DatasetVariableItem
              key={v.name}
              variable={v}
              onChange={handleVariableChange}
            />
          ))}
        </div>
      </div>
    </PropertyAccordionItem>
  );
};

export default DatasetItem;
