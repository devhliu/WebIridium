import { useAtomValue } from "jotai";

import { LINE_STYLES } from "@/features/lineStyle";

import { paletteAtom, type VariableSettings } from "@/globals/settings";

import PropertyList from "@/components/property-list/PropertyList";

import ColorProperty from "@/components/property-list/ColorProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";
import PropertyHeading from "@/components/property-list/PropertyHeading";
import SelectProperty from "@/components/property-list/SelectProperty";

export interface VariableSettingsPropertyListProps {
  settings: VariableSettings;
  onVariableSettingsChange: (newSettings: VariableSettings) => void;
}

const LINE_STYLE_OPTIONS = Object.fromEntries(
  LINE_STYLES.map((style) => [style, style]),
);

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
      <SelectProperty
        name="Line Style"
        value={settings.lineStyle}
        options={LINE_STYLE_OPTIONS}
        onChange={handleChangeFor("lineStyle")}
      />
    </PropertyList>
  );
};

export default VariableSettingsPropertyList;
