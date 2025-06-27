import { useRef, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useSimulator } from "./workspace";
import {
  variablesAtom,
  editorContentAtom,
  parameterScanOptionsAtom,
  independentVariableAtom,
} from "@/stores/workspace";
import type { Variable } from "./simulation/Simulator";
import { WorkerTermination } from "./workerPool";
import { useAtomValue } from "jotai";

/**
 * TODO: unit test this
 * Updates the current variable list so it contains all the same variables as the new one,
 * preserving user settings for the variables.
 */
const patchVariables = (
  currentVariables: Variable[],
  newVariables: Variable[],
): Variable[] => {
  const currentSet = new Set(currentVariables.map((v) => v.name));
  const newSet = new Set(newVariables.map((v) => v.name));

  const result = [];
  for (const variable of currentVariables) {
    if (newSet.has(variable.name)) {
      result.push(variable);
    }
  }
  for (const variable of newVariables) {
    if (!currentSet.has(variable.name)) {
      result.push(variable);
    }
  }

  return result;
};

// TODO: add useSetEditorContent which doesn't read (to be used in open file)
export const useEditorContent = () => {
  const simulator = useSimulator();
  const [independentVariable, setIndependentVariable] = useAtom(
    independentVariableAtom,
  );
  const setVariables = useSetAtom(variablesAtom);
  const editorContent = useAtomValue(editorContentAtom);
  const [parameterScanOptions, setParameterScanOptions] = useAtom(
    parameterScanOptionsAtom,
  );

  if (!editorContent) {
    throw new Error("where is the editor content?");
  }

  // TODO: abort every model info update when this is called from any component
  // TODO: Do not allow simulations while model info is being retrieved? This will prevent an out-of-sync model from being simulated.
  const abortControllerRef = useRef<AbortController | null>(null);
  const setEditorContent = useCallback(
    async (content: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      let newVariables: Variable[];
      try {
        newVariables = await simulator.loadModel(
          content,
          abortControllerRef.current.signal,
        );
      } catch (err) {
        if (err instanceof WorkerTermination) {
          return;
        } else {
          throw err;
        }
      }

      // if the independent variable no longer exists, fallback to time if possible
      if (
        !independentVariable ||
        !newVariables.find((v) => v.name === independentVariable)
      ) {
        setIndependentVariable(
          newVariables.find(
            (v) => v.name === simulator.defaultIndependentVariableName,
          )?.name ?? null,
        );
      }

      // if the variable no longer exists, use the first available scannable parameter
      // for the parameter scan
      if (
        !parameterScanOptions.varyingParameter ||
        !newVariables.some(
          (v) => v.scanName === parameterScanOptions.varyingParameter,
        )
      ) {
        setParameterScanOptions({
          ...parameterScanOptions,
          varyingParameter:
            // first try to use the first parameter
            newVariables.find((v) => v.category === "Parameter" && v.scanName)
              ?.scanName ??
            // if no parameteres found, use the first available
            newVariables.find((v) => v.scanName)?.scanName,
        });
      }

      setVariables((old) => patchVariables(old, newVariables));
      editorContent.setValue(content);
    },
    [
      independentVariable,
      setIndependentVariable,
      setVariables,
      editorContent,
      parameterScanOptions,
      setParameterScanOptions,
      simulator,
    ],
  );

  return { editorContent, setEditorContent };
};

/**
 * Container for editor content. Has a "change" event that fires
 * every time the editor content changes. This is necessary because
 * there needs to be a way to express data flowing exclusively form
 * the event content so that components sychronizing with it know
 * whether to update the model info (by call setEditorContent from the useEditorContent hook).
 */
export class EditorContent extends EventTarget {
  value: string;

  constructor() {
    super();
    this.value = "";
  }

  setValue(newValue: string) {
    this.value = newValue;
    this.dispatchEvent(new Event("change"));
  }
}
