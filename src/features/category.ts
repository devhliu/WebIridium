// Helpful utilities for managing variable categories and grouping them up

import type { VariableSettings } from "@/globals/workspace/settings";
import type { Variable } from "./simulation/Simulator";
import type { SelectGroupedProps } from "@/components/input/Select";
import { getVariableFullName } from "./simulation/variableNames";

export const CATEGORY_ORDER = [
  "Floating Species",
  "Boundary Species",
  "Rate of Changes",
  "Parameters",
  "ODEs",
  "Reaction Rates",
];

export type Category = (typeof CATEGORY_ORDER)[number];

/**
 * Groups variables into categories, following the pre-defined category order.
 *
 * @param variables - list of variables
 * @param categoryOrder - custom category order (optional)
 * @returns an array of tuple [categoryName, variables]
 */
export const groupVariables = <TVar extends Variable>(
  variables: TVar[],
  categoryOrder: string[] = CATEGORY_ORDER,
): [categoryName: string, variables: TVar[]][] => {
  const groupedVariables = Object.groupBy(
    variables,
    (v) => v.category,
  ) as Record<string, TVar[]>;
  const sortedGroupedVariables = Object.entries(groupedVariables).toSorted(
    ([a, _], [b, __]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );
  return sortedGroupedVariables;
};

/**
 * Convenience function that groups variables into a format usable by the Select
 * component.
 *
 * @param variables - list of variables
 * @param nameSelector - given a variable, return a string that will be used as the name value
 * @param displayNameSelector - function that receives the Variable and VariableSettings and returns a display name to be used
 *                              for the select component
 *
 * @returns variables grouped into a format usable by the select component
 */
export const groupVariablesForSelectComponent = <TVar extends Variable>(
  variables: TVar[],
  variableSettingss: Record<string, VariableSettings>,
  displayNameSelector: (
    variable: Variable,
    settings: VariableSettings,
  ) => string = getVariableFullName,
): SelectGroupedProps["groups"] => {
  return groupVariables(variables).reduce((acc, [category, variables]) => {
    return {
      ...acc,
      [category]: Object.fromEntries(
        variables.map((v) => [
          displayNameSelector(v, variableSettingss[v.name]),
          v.name,
        ]),
      ),
    };
  }, {});
};
