import { useAtomValue } from "jotai";

import { type SettableVariable } from "@/features/simulation/Simulator";

import { useToast } from "@/components/Toast";
import Button from "@/components/Button";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";

import { variablesMapAtom } from "@/globals/workspace/model";
import { variableSliderStatesAtom } from "@/globals/workspace/slider";
import { editorActionsDispatcherAtom } from "@/globals/workspace/editorActions";

const DEFAULT_PRESET_NAME = "Unnamed";

// TODO: add unit tests for this
const AddAsCommentButton = () => {
  const { toast } = useToast();

  const variablesMap = useAtomValue(variablesMapAtom);
  const variableSliderStates = useAtomValue(variableSliderStatesAtom);

  const editorActionsDispatcher = useAtomValue(editorActionsDispatcherAtom);

  const handleAddAsComment = () => {
    const preset: Record<string, number> = {};
    let didAdd = false;

    for (const [name, state] of Object.entries(variableSliderStates)) {
      const variable = variablesMap.get(name);
      if (
        !variable ||
        (variable as SettableVariable).defaultValue === state.value
      ) {
        continue;
      }

      preset[variable.name] = state.value;
      didAdd = true;
    }

    if (!didAdd) {
      toast({
        type: "warning",
        title: "Sliders unchanged",
        description:
          "There is nothing to add. Your sliders are their default values. Move your sliders around then try again.",
      });
    } else {
      void editorActionsDispatcher?.addPresetAsComment(
        DEFAULT_PRESET_NAME,
        preset,
      );
    }
  };

  return (
    <Button onClick={handleAddAsComment}>
      <PlusIcon width="1em" height="1em" />
      Add as Comment
    </Button>
  );
};

export default AddAsCommentButton;
