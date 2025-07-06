import { useAtomValue } from "jotai";

import { paletteAtom, type VariableSettings } from "@/stores/workspace";

import PropertyList from "@/components/property-list/PropertyList";

import ColorProperty from "@/components/property-list/ColorProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";
import PropertyHeading from "@/components/property-list/PropertyHeading";

export interface VariableSettingsPropertyListProps {
  settings: VariableSettings;
  onVariableSettingsChange: (newSettings: VariableSettings) => void;
}

const VariableSettingsPropertyList = ({
  settings,
  onVariableSettingsChange,
}: VariableSettingsPropertyListProps) => {
  const palette = useAtomValue(paletteAtom);
  const handleChangeFor = (setting: keyof VariableSettings) => {
    return (newValue: unknown) => {
      onVariableSettingsChange({
        ...settings,
        [setting]: newValue,
      });
    };
  };

  return (
    <PropertyList alignment="leftSmall">
      <PropertyHeading>Plot Settings</PropertyHeading>
      {palette === "Custom" && (
        <ColorProperty
          name="Color"
          value={settings.color}
          onChange={handleChangeFor("color")}
        />
      )}
      <NumericSliderProperty
        name="Width"
        value={settings.width}
        min={0.5}
        max={25}
        step={0.5}
        onChange={handleChangeFor("width")}
      />
    </PropertyList>
  );
};

export default VariableSettingsPropertyList;
