import * as monaco from "monaco-editor";

export const LENS_ID = "togglePreset";

const PRESET_PREFIX = "// Preset: ";
// TODO: handle scientific notation for the second capture group
const PRESET_COMMENT_START_REGEX = /\s*\/\*\s*/;
const PRESET_COMMENT_END_REGEX = /\s*\*\/\s*/;
const PRESET_VALUE_REGEX =
  /^\s*([A-Za-z_'][A-Za-z0-9_']*)+\s*=\s*(\d\d*\.?\d*)$/;
// this is a string so it can be used in the findMatches monaco API
const PRESET_START_REGEX = "^\\s*// Preset:.+$";

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
 * This only handles the text portion of toggle preset.
 * You must also provide a callback to handle updating the sliders
 * or whatever else.
 *
 * @param model - model for the editor
 * @param updateCallback - will be called when a preset is toggled on to handle
 *                         any extra effects such as updating the sliders
 *
 * @returns a command handler to toggle a preset
 */
export const createTogglePresetCommandHandler = (
  model: monaco.editor.IModel,
  updateCallback: (preset: Record<string, number>) => void,
): monaco.editor.ICommandHandler => {
  return (_, range: monaco.Range) => {
    const totalLines = model.getLineCount();

    const matches = model.findMatches(
      PRESET_START_REGEX,
      true,
      true,
      true,
      null,
      false,
    );

    const editOperations: monaco.editor.IIdentifiedSingleEditOperation[] = [];

    for (const match of matches) {
      const matchLineNumber = match.range.startLineNumber;
      const isTogglingOn = matchLineNumber === range.startLineNumber;
      const isOpen =
        matchLineNumber < totalLines &&
        !PRESET_COMMENT_START_REGEX.test(
          model.getLineContent(matchLineNumber + 1),
        );
      const preset: Record<string, number> = {};

      if (isOpen) {
        // look for where the values end to add a closing comment
        for (let i = matchLineNumber + 1; i <= totalLines + 1; i++) {
          if (
            i === totalLines + 1 ||
            !PRESET_VALUE_REGEX.test(model.getLineContent(i))
          ) {
            editOperations.push({
              range: {
                startLineNumber: i - 1,
                endLineNumber: i,
                startColumn: model.getLineMaxColumn(i - 1),
                endColumn: 1,
              },
              text: "\n*/\n",
            });
            editOperations.push({
              range: {
                startLineNumber: matchLineNumber,
                endLineNumber: matchLineNumber + 1,
                startColumn: model.getLineMaxColumn(matchLineNumber),
                endColumn: 1,
              },
              text: "\n/*\n",
            });
            break;
          }
        }
      } else if (isTogglingOn) {
        // open it
        for (let i = matchLineNumber + 2; i <= totalLines; i++) {
          const lineContent = model.getLineContent(i);
          if (PRESET_COMMENT_END_REGEX.test(lineContent)) {
            // delete the comment start and ends
            editOperations.push({
              range: {
                startLineNumber: matchLineNumber + 1,
                endLineNumber: matchLineNumber + 2,
                startColumn: 1,
                endColumn: 1,
              },
              text: "",
            });
            editOperations.push({
              range: {
                startLineNumber: i,
                endLineNumber: i + 1,
                startColumn: 1,
                endColumn: 1,
              },
              text: "",
            });
            updateCallback(preset);
            break;
          } else {
            // collect the preset values
            const match = lineContent.match(PRESET_VALUE_REGEX);
            if (!match) break;
            const name = match[1].trim();
            const value = Number(match[2]);
            if (isNaN(value)) break;
            preset[name] = value;
          }
        }
      }
    }

    if (editOperations.length > 0) {
      model.pushEditOperations(
        [
          new monaco.Selection(
            range.startLineNumber,
            range.startColumn,
            range.endLineNumber,
            range.endColumn,
          ),
        ],
        editOperations,
        () => [
          new monaco.Selection(
            range.startLineNumber,
            range.startColumn,
            range.endLineNumber,
            range.endColumn,
          ),
        ],
      );
    }
  };
};

/**
 * @param commandId - the id of the command to toggle a preset
 */
export const createTogglePresetProvider = (
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
            title: "Toggle Preset",
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
