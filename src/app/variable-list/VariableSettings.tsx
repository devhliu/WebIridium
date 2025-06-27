import PropertyList from "@/components/property-list/PropertyList";
import type { Variable } from "@/features/simulation/Simulator";

import ColorProperty from "@/components/property-list/ColorProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";

export interface VariableSettingsProps {
  variable: Variable;
  onVariableChange: (newVariable: Variable) => void;
}

const VariableSettings = ({
  variable,
  onVariableChange,
}: VariableSettingsProps) => {
  const handleChangeFor = (setting: keyof Variable) => {
    return (newValue: unknown) => {
      onVariableChange({
        ...variable,
        [setting]: newValue,
      });
    };
  };

  return (
    <PropertyList alignment="leftSmall">
      <ColorProperty
        name="Color"
        value={variable.color}
        onChange={handleChangeFor("color")}
      />
      <NumericSliderProperty
        name="Width"
        value={variable.width}
        min={0.5}
        max={25}
        step={0.5}
        onChange={handleChangeFor("width")}
      />
    </PropertyList>
  );
};

export default VariableSettings;
