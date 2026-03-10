import { useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import styles from "./GraphSettingsControls.module.css";
import {
  addGraphPresetAtom,
  builtinGraphPresets,
  defaultGraphSettings,
  deleteCurrentGraphPresetAtom,
  graphPresetNameAtom,
  graphPresetsAtom,
  PROJECT_PRESET_NAME,
  renameCurrentGraphPresetAtom,
  updateGraphSettingsAtom,
} from "@/globals/graphPresets";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";
import PencilIcon from "@/assets/icons/PencilIcon.svg?react";
import TrashIcon from "@/assets/icons/TrashIcon.svg?react";
import ResetIcon from "@/assets/icons/ResetIcon.svg?react";
import ThreeDotsIcon from "@/assets/icons/ThreeDotsIcon.svg?react";
import Select from "@/components/input/Select";
import IconButton from "@/components/IconButton";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu";
import { useToast } from "@/components/Toast";

const GraphSettingsControls = () => {
  const [graphPresetName, setGraphPresetName] = useAtom(graphPresetNameAtom);
  const graphPresets = useAtomValue(graphPresetsAtom);
  const updateGraphSettings = useSetAtom(updateGraphSettingsAtom);
  const renameCurrentGraphPreset = useSetAtom(renameCurrentGraphPresetAtom);
  const deleteCurrentGraphPreset = useSetAtom(deleteCurrentGraphPresetAtom);
  const addGraphPreset = useSetAtom(addGraphPresetAtom);
  const { toast } = useToast();

  const isUserMade = Object.hasOwn(graphPresets.shared, graphPresetName);

  const groups = useMemo(() => {
    const result: Record<string, Record<string, string>> = {
      Project: {
        [PROJECT_PRESET_NAME]: PROJECT_PRESET_NAME,
      },
      "Builtin (Shared)": Object.fromEntries(
        Object.keys(graphPresets.builtins).map((v) => [v, v]),
      ),
    };

    if (Object.keys(graphPresets.shared).length > 0) {
      result["User (Shared)"] = Object.fromEntries(
        Object.keys(graphPresets.shared).map((v) => [v, v]),
      );
    }

    return result;
  }, [graphPresets]);

  const [renamingTo, setRenamingTo] = useState<string>();
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleRename = () => {
    setRenamingTo(graphPresetName);

    // fix dropdown closing stealing focus
    // https://github.com/radix-ui/primitives/issues/3106
    setTimeout(() => {
      renameInputRef.current?.focus();
    }, 100);
  };

  const finishRename = () => {
    if (renamingTo) {
      const err = renameCurrentGraphPreset(renamingTo);
      if (err) {
        toast({
          type: "error",
          title:
            err === "cantRename"
              ? "Can't rename this preset."
              : "Name already taken.",
          description:
            err === "cantRename"
              ? "You can only rename user-made presets."
              : "You cannot have duplicate names.",
        });
      }
    }
    setRenamingTo(undefined);
  };

  const handleReset = () => {
    const builtin = builtinGraphPresets[graphPresetName];
    if (builtin) {
      updateGraphSettings(builtin);
    } else {
      updateGraphSettings(defaultGraphSettings);
    }
  };

  const handleDelete = () => {
    deleteCurrentGraphPreset();
  };

  return (
    <div className={styles.controls}>
      <label htmlFor="graphPreset" className={styles.presetLabel}>
        Preset
      </label>

      {renamingTo !== undefined ? (
        <input
          id="rename-graph-preset"
          ref={renameInputRef}
          type="text"
          placeholder="Preset Name"
          className={styles.rename}
          autoFocus
          autoComplete="off"
          value={renamingTo}
          onChange={(e) => setRenamingTo(e.target.value)}
          onBlur={finishRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              finishRename();
            } else if (e.key === "Escape") {
              // cancel
              setRenamingTo(undefined);
            }
          }}
        />
      ) : (
        <Select
          name="graphPreset"
          value={graphPresetName}
          className={styles.presetSelect}
          groups={groups}
          onChange={setGraphPresetName}
        />
      )}

      <IconButton label="Add" onClick={addGraphPreset}>
        <PlusIcon width="1em" height="1em" />
      </IconButton>
      <DropdownMenuRoot>
        <DropdownMenuTrigger>
          <IconButton label="Options">
            <ThreeDotsIcon width="1em" height="1em" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            name="Rename"
            onSelect={handleRename}
            disabled={!isUserMade}
            icon={<PencilIcon width="1em" height="1em" />}
          />
          <DropdownMenuItem
            name="Reset to Default"
            onSelect={handleReset}
            icon={<ResetIcon width="1em" height="1em" />}
          />
          <DropdownMenuItem
            name="Delete"
            onSelect={handleDelete}
            disabled={!isUserMade}
            icon={<TrashIcon width="1em" height="1em" />}
          />
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>
  );
};

export default GraphSettingsControls;
