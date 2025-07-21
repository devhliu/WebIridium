import type { Variable } from "./Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";

/**
 * Gets the display name for a variable in a "set" context
 * which is when you are setting it with something like the
 * sliders or parameter scan.
 */
export const getVariableSetDisplayName = (
  variable: Variable,
  settings: VariableSettings,
): string => {
  return variable.category === "Floating Species"
    ? `init(${settings.displayName})`
    : settings.displayName;
};
