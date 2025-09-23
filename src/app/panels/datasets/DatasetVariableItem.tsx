import type { DatasetVariable } from "@/globals/workspace/datasets";
import GenericVariableItem from "../simulation/variable-list/GenericVariableItem";
import PropertyList from "@/components/property-list/PropertyList";
import PropertyHeading from "@/components/property-list/PropertyHeading";
import ColorProperty from "@/components/property-list/ColorProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";

export interface DatasetVariableItemProps {
  variable: DatasetVariable;
  onChange: (newVariable: DatasetVariable) => void;
}

const DatasetVariableItem = ({
  variable,
  onChange,
}: DatasetVariableItemProps) => {
  const handleChangeFor = (property: keyof DatasetVariable) => {
    return (value: DatasetVariable[typeof property]) => {
      onChange({
        ...variable,
        [property]: value,
      });
    };
  };

  return (
    <GenericVariableItem
      name={variable.displayName}
      visible={variable.visible}
      onVisibleChange={handleChangeFor("visible")}
    >
      <PropertyList alignment="leftSmall">
        <PropertyHeading>Plot Settings</PropertyHeading>
        <ColorProperty
          name="Color"
          value={variable.color}
          onChange={handleChangeFor("color")}
        />
        <NumericSliderProperty
          name="Size"
          value={variable.size}
          onChange={handleChangeFor("size")}
          min={1}
          max={100}
          step={1}
        />
      </PropertyList>
    </GenericVariableItem>
  );
};

export default DatasetVariableItem;
