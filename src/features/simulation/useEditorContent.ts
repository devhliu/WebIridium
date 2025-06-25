import { useRef, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useSimulator } from "../workspace";
import { type Variable } from "./Simulator";
import {
  variablesAtom,
  editorContentAtom,
  parameterScanOptionsAtom,
} from "@/stores/workspace";

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
  const setVariables = useSetAtom(variablesAtom);
  const [editorContent, setEditorContentInternal] = useAtom(editorContentAtom);
  const [parameterScanOptions, setParameterScanOptions] = useAtom(
    parameterScanOptionsAtom,
  );

  // TODO: abort every model info update when this is called from any component
  // TODO: Do not allow simulations while model info is being retrieved? This will prevent an out-of-sync model from being simulated.
  const abortControllerRef = useRef<AbortController | null>(null);
  const setEditorContent = useCallback(
    async (content: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const newVariables = await simulator.loadModel(
        content,
        abortControllerRef.current.signal,
      );
      if (
        !newVariables.some(
          (v) => v.scanName === parameterScanOptions.varyingParameter,
        )
      ) {
        // the variable no longer exists, use the first available scannable parameter
        // for the parameter scan
        setParameterScanOptions({
          ...parameterScanOptions,
          varyingParameter: newVariables.find((v) => v.scanName)?.scanName,
        });
      }

      setVariables(old => patchVariables(old, newVariables));
      setEditorContentInternal(content);
    },
    [
      setVariables,
      setEditorContentInternal,
      parameterScanOptions,
      setParameterScanOptions,
      simulator,
    ],
  );

  return { editorContent, setEditorContent };
};
