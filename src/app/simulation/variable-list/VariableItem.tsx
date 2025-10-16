import { memo } from "react";

import { type Variable } from "@/features/simulation/Simulator";
import { getVariableFullName } from "@/features/simulation/variableNames";

import type { VariableSettings } from "@/globals/settings";

import GenericVariableItem from "./GenericVariableItem";
import VariableSettingsPropertyList from "./VariableSettingsPropertyList";

export interface VariableItemProps {
  variable: Variable;
  settings: VariableSettings;
  onVariableSettingsChange: (newSettings: VariableSettings) => void;
}

const VariableItem = memo(
  ({ variable, settings, onVariableSettingsChange }: VariableItemProps) => {
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
        name={getVariableFullName(variable, settings)}
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
