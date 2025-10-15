import { useAtomValue } from "jotai";

import buttonStyles from "@/components/Button.module.css";

import { useToast } from "@/components/Toast";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";

import { variablesMapAtom } from "@/globals/workspace/model";
import { variableSliderStatesAtom } from "@/globals/workspace/slider";
import { editorActionsDispatcherAtom } from "@/globals/workspace/editorActions";

const DEFAULT_PRESET_NAME = "Unnamed";

// TODO: add unit tests for this
const CopyToModelButton = () => {
  const { toast } = useToast();

  const variablesMap = useAtomValue(variablesMapAtom);
  const variableSliderStates = useAtomValue(variableSliderStatesAtom);

  const editorActionsDispatcher = useAtomValue(editorActionsDispatcherAtom);

  const handleAddAsComment = () => {
    const preset: Record<string, number> = {};
    let didAdd = false;

    for (const [name, state] of Object.entries(variableSliderStates)) {
      const variable = variablesMap.get(name);
      if (!variable) continue;

      preset[variable.name] = state.value;
      didAdd = true;
    }

    if (!didAdd) {
      toast({
        type: "warning",
        title: "Sliders unchanged",
        description: "No sliders are activate. Activate one and try again.",
      });
    } else {
      void editorActionsDispatcher?.addPresetAsComment(
        DEFAULT_PRESET_NAME,
        preset,
      );
    }
  };

  return (
    <button className={buttonStyles.default} onClick={handleAddAsComment}>
      <PlusIcon width="1em" height="1em" />
      Copy to Model
    </button>
  );
};

export default CopyToModelButton;
