import { WorkerPool } from "./workerPool";
import { createWorker } from "./workers";

const antimonyWorkerPool = new WorkerPool(() => createWorker("antimony"), {
  maxWorkers: 1,
});

export const convertSbmlToAntimony = async (sbml: string): Promise<string> => {
  const result = (await antimonyWorkerPool.queueTask(
    "convertSbmlToAntimony",
    {
      sbml,
    },
    null,
  )) as string;
  return result;
};

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
 * Adds a slider variable presets to an antimony model as an appended multi-line comment.
 *
 * @param code - the antimony code to add the preset to
 * @param presetName - name of the preset which will be added as a comment
 * @param presets - Record of variable name to value.
 * @returns a new antimony model with this format:
 * ```ant
 * model Name
 *  ...
 *
 *  // Preset: presetName
 *  /asterisk (multi-line comments can't be nested ??)
 *  var1: value
 *  var2: value
 *  ...
 *  varN: value
 *  asterisk/
 * end
 * ```
 */
export const addVariablePresetsToModel = (
  code: string,
  presetName: string,
  presets: { [variable: string]: number },
): string => {
  const lines = code.split("\n");
  const variablesLine = Object.entries(presets).map(
    ([name, value]) => `${name} = ${value}`,
  );

  const presetLines = [
    `// Preset: ${presetName}`,
    "/*",
    ...variablesLine,
    "*/",
  ];

  // First, try to see if there is a model declaration
  // If there is, try to insert the preset inside the model
  let isInsideModel = false;
  let isAntimonyGenerated = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isInsideModel) {
      if (MODEL_END_REGEX.test(line)) {
        // ok model end reached, insert some the preset string before it
        const indentation = getIndentationString(lines[i - 1]);
        const splicing = [];
        splicing.push("");

        for (const line of presetLines) {
          splicing.push(indentation + line);
        }

        lines.splice(i, 0, ...splicing);

        return lines.join("\n");
      } else if (isAntimonyGenerated && ANTIMONY_OTHER_DECLS_REGEX.test(line)) {
        console.log("WHAT");
        // insert it before the "Other Declarations" generated portion
        const indentation = getIndentationString(lines[i - 2]);
        const splicing = [];
        splicing.push("");

        for (const line of presetLines) {
          splicing.push(indentation + line);
        }

        lines.splice(i - 1, 0, ...splicing);

        return lines.join("\n");
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
  const indentation = getIndentationString(lines[lines.length - 1]);
  lines.push("");

  for (const line of presetLines) {
    lines.push(indentation + line);
  }

  return lines.join("\n");
};
