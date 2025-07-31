import { describe, expect, it } from "vitest";
import { addVariablePresetsToModel } from "../antimony";

const testFiles: Record<string, string> = import.meta.glob(
  "./presetTests/*.ant",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

describe("addVariablePresetsToModel", () => {
  const PRESET_NAME = "test";
  const PRESETS = {
    A: 20,
    B: 30,
    C: 40,
  };

  const COMMENT_REGEX = /\s*\/\/ Preset:/;

  for (const [name, content] of Object.entries(testFiles)) {
    if (name.endsWith("_expected.ant")) continue;
    const nameWithoutExtension = name.substring(0, name.length - 4);
    const expectedContent = testFiles[`${nameWithoutExtension}_expected.ant`];

    it(`should work for ${name}`, () => {
      const [result, { line }] = addVariablePresetsToModel(
        content.trim(),
        PRESET_NAME,
        PRESETS,
      );
      expect(result).toBe(expectedContent.trim());
      expect(result.split("\n")[line]).toMatch(COMMENT_REGEX);
    });
  }
});
