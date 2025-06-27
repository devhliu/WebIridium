// Helpful utilities for managing variable categories and grouping them up

import type { Variable } from "./simulation/Simulator";
import type { SelectGroupedProps } from "@/components/input/Select";

export const CATEGORY_ORDER = ["Species", "Rate of Changes", "Parameter"];

/**
 * Groups variables into categories, following the pre-defined category order.
 * @param variables - list of variables
 * @returns an array of tuple [categoryName, variables]
 */
export const groupVariables = (
  variables: Variable[],
): [categoryName: string, variables: Variable[]][] => {
  const groupedVariables = Object.groupBy(
    variables,
    (v) => v.category,
  ) as Record<string, Variable[]>;
  const sortedGroupedVariables = Object.entries(groupedVariables).toSorted(
    ([a, _], [b, __]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );
  return sortedGroupedVariables;
};

/**
 * Convenience function that groups variables into a format usable by the Select
 * component.
 *
 * @param variables - list of variables
 * @param nameSelector - given a variable, return a string that will be used as the name value
 *
 * @returns variables grouped into a format usable by the select component
 */
export const groupVariablesForSelectComponent = (
  variables: Variable[],
  nameSelector: (v: Variable) => string,
): SelectGroupedProps["groups"] => {
  return groupVariables(variables).reduce((acc, [category, variables]) => {
    return {
      ...acc,
      [category]: Object.fromEntries(
        variables.map((v) => [v.displayName, nameSelector(v)]),
      ),
    };
  }, {});
};
