import { markerSymbols, type DatasetVariable } from "@/globals/overlays";
import GenericVariableItem from "../simulation/variable-list/GenericVariableItem";
import PropertyList from "@/components/property-list/PropertyList";
import PropertyHeading from "@/components/property-list/PropertyHeading";
import ColorProperty from "@/components/property-list/ColorProperty";
import SelectProperty from "@/components/property-list/SelectProperty";

const markerSymbolOptions = Object.fromEntries(
  markerSymbols.map((s) => [s, s]),
);

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
        <SelectProperty
          name="Marker"
          value={variable.marker}
          onChange={handleChangeFor("marker") as (newValue: string) => void}
          options={markerSymbolOptions}
        />
      </PropertyList>
    </GenericVariableItem>
  );
};

export default DatasetVariableItem;
