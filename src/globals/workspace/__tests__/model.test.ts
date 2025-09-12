import { describe, expect, it } from "vitest";
import type { VariableSettings } from "../settings";
import type { Variable } from "@/features/simulation/Simulator";
import { patchVariablesSettings } from "../model";

describe("patchVariableSettings", () => {
  const v1: VariableSettings = {
    displayName: "test",
    color: "red",
    visible: true,
    lineStyle: "solid",
    width: 5,
  };

  const v2: VariableSettings = {
    displayName: "test2",
    color: "blue",
    visible: true,
    lineStyle: "dot",
    width: 5,
  };

  const v3: VariableSettings = {
    displayName: "test3",
    color: "green",
    visible: false,
    lineStyle: "solid",
    width: 5,
  };

  const variableSettingss = {
    test: v1,
    test2: v2,
    test3: v3,
  };

  const variables: Variable[] = [
    {
      type: "settable",
      category: "Floating Species",
      defaultDisplayName: "test",
      defaultValue: 2,
      name: "test",
      setName: "init([test])",
    },
    {
      type: "settable",
      category: "Floating Species",
      defaultDisplayName: "test2",
      defaultValue: 3,
      name: "test2",
      setName: "init([test2])",
    },
    {
      type: "settable",
      category: "Parameter",
      defaultDisplayName: "test3",
      defaultValue: 1,
      name: "test3",
      setName: "test3",
    },
  ];

  it("should not overwrite the variable when it is the same", () => {
    const result = patchVariablesSettings(
      variables,
      variableSettingss,
      variables,
      false,
    );

    expect(result).toEqual(variableSettingss);
  });

  it("should overwrite the all variables when told to", () => {
    const result = patchVariablesSettings(
      variables,
      variableSettingss,
      variables,
      true,
    );

    expect(result).not.toEqual(variableSettingss);
  });

  it("should add new variables", () => {
    const result = patchVariablesSettings(
      variables,
      variableSettingss,
      [
        ...variables,
        {
          type: "settable",
          category: "Boundary Species",
          defaultDisplayName: "test4",
          defaultValue: 1,
          name: "test4",
          setName: "test4",
        },
      ],
      false,
    );

    expect(result).toMatchObject({
      ...variableSettingss,
      test4: {
        displayName: "test4",
      },
    });
  });

  it("should overwrite the variable when the category is different", () => {
    const result = patchVariablesSettings(
      variables,
      variableSettingss,
      variables.map((v) =>
        v.name === "test3"
          ? {
              ...v,
              category: "Boundary Species",
              defaultDisplayName: "different",
            }
          : v,
      ),
      false,
    );

    expect(result).toMatchObject({
      ...variableSettingss,
      test3: {
        displayName: "different",
      },
    });
  });
});
