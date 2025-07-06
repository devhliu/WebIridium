import { useRef, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useSimulator } from "./workspace";
import {
  variablesAtom,
  editorContentAtom,
  parameterScanOptionsAtom,
  independentVariableAtom,
  modelStatusAtom,
  variableSettingssAtom,
  type VariableSettings,
} from "@/stores/workspace";
import type { SettableVariable, Variable } from "./simulation/Simulator";
import { WorkerTermination } from "./workerPool";
import { generateDefaultCustomPalette } from "./colors";

const MODEL_LOAD_DEBOUNCE = 500; // in ms

// TODO: unit test this?
const patchVariablesSettings = (
  currentVariablesSettings: Record<string, VariableSettings>,
  newVariables: Variable[],
): Record<string, VariableSettings> => {
  const adding: Record<string, VariableSettings> = {};
  const colorGenerator = generateDefaultCustomPalette();

  const isPriorityVariable = (variable: Variable) =>
    variable.category === "Species" || variable.category === "Time";

  // first pass for prioritized variables (this is so they get the good default colors)
  for (const variable of newVariables) {
    if (
      !currentVariablesSettings[variable.name] &&
      isPriorityVariable(variable)
    ) {
      adding[variable.name] = {
        displayName: variable.defaultDisplayName,
        visible: variable.category !== "Time",
        color: colorGenerator.next().value!,
        width: 2,
      };
    }
  }

  // second pass for everything else
  for (const variable of newVariables) {
    if (
      !currentVariablesSettings[variable.name] &&
      !isPriorityVariable(variable)
    ) {
      adding[variable.name] = {
        displayName: variable.defaultDisplayName,
        visible: false,
        color: colorGenerator.next().value!,
        width: 2,
      };
    }
  }

  if (Object.keys(adding).length === 0) {
    return currentVariablesSettings;
  } else {
    return { ...currentVariablesSettings, ...adding };
  }
};

export const useEditorContent = () => {
  const simulator = useSimulator();
  const [independentVariable, setIndependentVariable] = useAtom(
    independentVariableAtom,
  );
  const setVariables = useSetAtom(variablesAtom);
  const setVariableSettingss = useSetAtom(variableSettingssAtom);
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
        if (skipDebounce) {
          newVariables = await simulator.loadModel(
            content,
            thisAbortController.signal,
          );
        } else {
          newVariables = await new Promise((resolve) =>
            setTimeout(resolve, MODEL_LOAD_DEBOUNCE),
          )
            .then(() => {
              if (thisAbortController.signal.aborted) {
                throw new WorkerTermination();
              }
            })
            .then(() =>
              simulator.loadModel(content, thisAbortController.signal),
            );
        }
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
          (v) =>
            "setName" in v &&
            v.setName === parameterScanOptions.varyingParameter,
        )
      ) {
        const firstAvailableParameter = newVariables.find(
          (v) => "setName" in v && v.category === "Parameters",
        ) as SettableVariable;
        setParameterScanOptions({
          ...parameterScanOptions,
          varyingParameter:
            // first try to use the first parameter
            firstAvailableParameter?.setName ??
            // if no parameteres found, use the first available
            newVariables.find((v) => "setName" in v)?.setName,
        });
      }

      setVariables(newVariables);
      setVariableSettingss((old) => patchVariablesSettings(old, newVariables));
      setModelStatus({ type: "success" });
    },
    [
      independentVariable,
      setIndependentVariable,
      setVariables,
      setVariableSettingss,
      setEditorContent,
      setModelStatus,
      parameterScanOptions,
      setParameterScanOptions,
      simulator,
    ],
  );

  return { editorContent, updateEditorContent };
};
