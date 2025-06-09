import { useRef, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useSimulator } from "../workspace";
import {
  modelInfoAtom,
  editorContentAtom,
  parameterScanParametersAtom,
} from "@/stores/workspace";
import type { ModelInfo } from "@/third-party/copasi";
import { type Simulator } from "@/features/simulation/Simulator";

const hasParameter = (
  simulator: Simulator,
  modelInfo: ModelInfo,
  name: string | null,
): boolean => {
  return Boolean(
    modelInfo.global_parameters.find((param) => param.name === name) ||
      modelInfo.species.find(
        (specie) => simulator.getParameterFromSpecies(specie.name) === name,
      ),
  );
};

export const useEditorContent = () => {
  const simulator = useSimulator();
  const setModelInfo = useSetAtom(modelInfoAtom);
  const [editorContent, setEditorContentInternal] = useAtom(editorContentAtom);
  const [parameterScanParameters, setParameterScanParameters] = useAtom(
    parameterScanParametersAtom,
  );

  // TODO: abort every model info update when this is called for anything
  const abortControllerRef = useRef<AbortController | null>(null);
  const setEditorContent = useCallback(
    async (content: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const modelInfo = await simulator.getModelInfo(
        content,
        abortControllerRef.current.signal,
      );
      if (
        !hasParameter(
          simulator,
          modelInfo,
          parameterScanParameters.varyingParameter,
        )
      ) {
        setParameterScanParameters({
          ...parameterScanParameters,
          varyingParameter: modelInfo.global_parameters[0]?.name,
        });
      }

      setModelInfo(modelInfo);
      setEditorContentInternal(content);
    },
    [
      setModelInfo,
      setEditorContentInternal,
      parameterScanParameters,
      setParameterScanParameters,
      simulator,
    ],
  );

  return { editorContent, setEditorContent };
};
