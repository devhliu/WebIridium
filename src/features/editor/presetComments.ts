import * as monaco from "monaco-editor";

export const LENS_ID = "loadPreset";

const PRESET_PREFIX = "// Parameter Set: ";
// TODO: handle scientific notation for the second capture group
const PRESET_COMMENT_START_REGEX = /\s*\/\*\s*/;
const PRESET_COMMENT_END_REGEX = /\s*\*\/\s*/;
const PRESET_VALUE_REGEX =
  /^\s*([A-Za-z_'][A-Za-z0-9_']*)+\s*=\s*(\d\d*\.?\d*)$/;
// this is a string so it can be used in the findMatches monaco API
const PRESET_START_REGEX = "^\\s*// Parameter Set:(.+)$";

const ANTIMONY_GENERATED_REGEX = /^\/\/ Created by libAntimony v[0-9.]+$/;
// after this part, there are no more initializations, so we want to insert here
const ANTIMONY_OTHER_DECLS_REGEX = /\/\/ Other declarations:/;

const MODEL_START_REGEX =
  /\s*(model|module)\s+\*?\s*[A-Za-z_][A-Za-z0-9_]*\s*(\([A-Za-z0-9_,]*\))?/;
const MODEL_END_REGEX = /^\s*end\s*$/;

/**
 * @param line - line to get the indentation of
 * @returns string of the indentation of the line
 */
const getIndentationString = (line: string) => {
  const match = line.match(/^\s+/);
  if (!match) {
    return "";
  } else {
    return match[0];
  }
};

/**
 * Adds a slider variable presets to an antimony model as a multi-line comment.
 *
 * @param code - the antimony code to add the preset to
 * @param presetName - name of the preset which will be added as a comment
 * @param preset - record of (variable name: value).
 * @returns a tuple of the new antimony coded with the preset added as a comment and the
 *          index and column the preset name starts at (line and column start at 0)
 */
export const addVariablePresetToModel = (
  code: string,
  presetName: string,
  preset: { [variable: string]: number },
): [string, { line: number; column: number }] => {
  const lines = code.split("\n");
  const variablesLine = Object.entries(preset).map(
    ([name, value]) => `${name} = ${value}`,
  );

  const presetLines = [
    `${PRESET_PREFIX}${presetName}`,
    "/*",
    ...variablesLine,
    "*/",
  ];

  const insertAfter = (
    lineNumber: number,
  ): [string, { line: number; column: number }] => {
    const indentation = getIndentationString(lines[lineNumber]);
    const splicing = [];
    splicing.push("");

    for (const line of presetLines) {
      splicing.push(indentation + line);
    }

    lines.splice(lineNumber + 1, 0, ...splicing);

    return [
      lines.join("\n"),
      {
        line: lineNumber + 2,
        column: indentation.length + PRESET_PREFIX.length,
      },
    ];
  };

  // First, try to see if there is a model declaration
  // If there is, try to insert the preset inside the model
  let isInsideModel = false;
  let isAntimonyGenerated = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isInsideModel) {
      if (MODEL_END_REGEX.test(line)) {
        // ok model end reached, insert some the preset string before it
        return insertAfter(i - 1);
      } else if (isAntimonyGenerated && ANTIMONY_OTHER_DECLS_REGEX.test(line)) {
        // insert it before the "Other Declarations" generated portion
        return insertAfter(i - 2);
      }
    } else {
      if (MODEL_START_REGEX.test(line)) {
        isInsideModel = true;
      } else if (ANTIMONY_GENERATED_REGEX.test(line)) {
        isAntimonyGenerated = true;
      }
    }
  }

  // No model found, just append the preset
  return insertAfter(lines.length - 1);
};

// TODO: unit test this
/**
 * @param model - model for the editor
 * @param loadCallback - will be called when a preset is loaded
 *
 * @returns a command handler to toggle a preset
 */
export const createLoadPresetCommandHandler = (
  model: monaco.editor.IModel,
  updateCallback: (name: string, preset: Record<string, number>) => void,
): monaco.editor.ICommandHandler => {
  return (_, range: monaco.Range) => {
    const totalLines = model.getLineCount();
    const startLine = range.startLineNumber;
    const preset: Record<string, number> = {};
    const name = model.getLineContent(startLine).match(PRESET_START_REGEX)![1];

    for (let i = startLine + 1; i <= totalLines; i++) {
      const lineContent = model.getLineContent(i);
      const valueMatch = lineContent.match(PRESET_VALUE_REGEX);
      if (valueMatch) {
        const name = valueMatch[1].trim();
        const value = Number(valueMatch[2]);
        if (isNaN(value)) break;
        preset[name] = value;
      } else if (
        !(
          lineContent.match(PRESET_COMMENT_START_REGEX) ||
          lineContent.match(PRESET_COMMENT_END_REGEX)
        )
      ) {
        break;
      }
    }

    updateCallback(name, preset);
  };
};

/**
 * @param commandId - the id of the command to toggle a preset
 */
export const createLoadPresetProvider = (
  commandId: string,
): monaco.languages.CodeLensProvider => {
  return {
    provideCodeLenses: (model, _cancellationToken) => {
      const lenses: monaco.languages.CodeLens[] = [];
      // TODO: make sure that not only the Preset comment is there, but the rest of the values too
      const matches = model.findMatches(
        PRESET_START_REGEX,
        true,
        true,
        true,
        null,
        false,
      );

      for (const match of matches) {
        lenses.push({
          id: LENS_ID,
          range: match.range,
          command: {
            id: commandId,
            title: "Load Parameter Set",
            arguments: [match.range],
          },
        });
      }

      return {
        lenses,
        dispose: () => undefined,
      };
    },

    resolveCodeLens: (_, codeLens, __) => {
      return codeLens;
    },
  };
};
