import { useRef, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useSimulator } from "./workspace";
import {
  variablesAtom,
  editorContentAtom,
  parameterScanOptionsAtom,
  independentVariableAtom,
  modelStatusAtom,
} from "@/stores/workspace";
import type { Variable } from "./simulation/Simulator";
import { WorkerTermination } from "./workerPool";

const MODEL_LOAD_DEBOUNCE = 500; // in ms

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

export const useEditorContent = () => {
  const simulator = useSimulator();
  const [independentVariable, setIndependentVariable] = useAtom(
    independentVariableAtom,
  );
  const setVariables = useSetAtom(variablesAtom);
  const [editorContent, setEditorContent] = useAtom(editorContentAtom);
  const setModelStatus = useSetAtom(modelStatusAtom);
  const [parameterScanOptions, setParameterScanOptions] = useAtom(
    parameterScanOptionsAtom,
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const updateEditorContent = useCallback(
    async (
      content: string,
      { skipDebounce }: { skipDebounce?: boolean } = {},
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const thisAbortController = new AbortController();
      abortControllerRef.current = thisAbortController;

      setEditorContent(content);
      setModelStatus({ type: "loading" });

      let newVariables: Variable[];
      try {
        // wait a bit in case the user is still typing
        newVariables = await new Promise((resolve) =>
          setTimeout(resolve, skipDebounce ? 0 : MODEL_LOAD_DEBOUNCE),
        )
          .then(() => {
            if (thisAbortController.signal.aborted) {
              throw new WorkerTermination();
            }
          })
          .then(() => simulator.loadModel(content, thisAbortController.signal));
      } catch (err) {
        if (err instanceof WorkerTermination) {
          return;
        } else if (err instanceof Error) {
          setModelStatus({
            type: "error",
            message: err.message,
          });
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
      setModelStatus({ type: "success" });
    },
    [
      independentVariable,
      setIndependentVariable,
      setVariables,
      setEditorContent,
      setModelStatus,
      parameterScanOptions,
      setParameterScanOptions,
      simulator,
    ],
  );

  return { editorContent, updateEditorContent };
};
