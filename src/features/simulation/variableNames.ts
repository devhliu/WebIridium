import type { Variable } from "./Simulator";
import type { VariableSettings } from "@/globals/settings";

export const hasDisplayName = (
  variable: Variable,
  settings: VariableSettings,
): boolean => {
  // rate of changes always have a display name in COPASI.
  // not worth it to display the internal representation to the user
  return (
    variable.category !== "Rate of Changes" &&
    variable.name !== settings.displayName
  );
};

export const getVariableFullName = (
  variable: Variable,
  settings: VariableSettings,
): string => {
  if (hasDisplayName(variable, settings)) {
    return `${settings.displayName} (${variable.name})`;
  } else {
    return settings.displayName;
  }
};

/**
 * Gets the display name for a variable in a "set" context
 * which is when you are setting it with something like the
 * sliders or parameter scan.
 */
export const getVariableSetDisplayName = (
  variable: Variable,
  settings: VariableSettings,
): string => {
  const firstPart =
    variable.category === "Floating Species"
      ? `init([${settings.displayName}])`
      : settings.displayName;

  if (hasDisplayName(variable, settings)) {
    return `${firstPart} (${variable.name})`;
  } else {
    return firstPart;
  }
};
