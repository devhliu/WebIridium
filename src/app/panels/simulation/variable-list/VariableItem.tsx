import { memo } from "react";

import { type Variable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";
import GenericVariableItem from "./GenericVariableItem";
import VariableSettingsPropertyList from "./VariableSettingsPropertyList";

export interface VariableItemProps {
  variable: Variable;
  settings: VariableSettings;
  onVariableSettingsChange: (newSettings: VariableSettings) => void;
}

const VariableItem = memo(
  ({ settings, onVariableSettingsChange }: VariableItemProps) => {
    const handleVisibleChange = (visible: boolean) => {
      onVariableSettingsChange({
        ...settings,
        visible,
      });
    };

    return (
      <GenericVariableItem
        visible={settings.visible}
        onVisibleChange={handleVisibleChange}
        name={settings.displayName}
      >
        <VariableSettingsPropertyList
          settings={settings}
          onVariableSettingsChange={onVariableSettingsChange}
        />
      </GenericVariableItem>
    );
  },
);

export default VariableItem;
