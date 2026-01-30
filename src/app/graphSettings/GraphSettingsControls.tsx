import { useAtom } from "jotai";
import styles from "./GraphSettingsControls.module.css";
import { currentGraphPresetAtom, CUSTOM_PRESET } from "@/globals/settings";
import { graphPresets } from "@/features/graphPresets";

import PlusIcon from "@/assets/icons/PlusIcon.svg?react";
import PencilIcon from "@/assets/icons/PencilIcon.svg?react";
import TrashIcon from "@/assets/icons/TrashIcon.svg?react";
import ResetIcon from "@/assets/icons/ResetIcon.svg?react";
import Select from "@/components/input/Select";
import IconButton from "@/components/IconButton";

const PRESET_GROUPS = {
  Project: { Custom: CUSTOM_PRESET },
  Shared: Object.fromEntries(
    Object.keys(graphPresets).map((name) => [name, name]),
  ),
};

const GraphSettingsControls = () => {
  const [currentGraphPreset, setCurrentGraphPreset] = useAtom(
    currentGraphPresetAtom,
  );
  const isSelectingBuiltin =
    currentGraphPreset === CUSTOM_PRESET ||
    Object.hasOwn(graphPresets, currentGraphPreset);

  return (
    <div className={styles.controls}>
      <label htmlFor="graphPreset" className={styles.presetLabel}>
        Preset
      </label>
      <Select
        name="graphPreset"
        value={currentGraphPreset}
        className={styles.presetSelect}
        groups={PRESET_GROUPS}
        onChange={setCurrentGraphPreset}
      />
      <IconButton label="Add">
        <PlusIcon width="1em" height="1em" />
      </IconButton>
      <IconButton label="Rename">
        <PencilIcon width="1em" height="1em" />
      </IconButton>
      <IconButton label="Reset to Default">
        <ResetIcon width="1em" height="1em" />
      </IconButton>
      <IconButton label="Delete" disabled={isSelectingBuiltin}>
        <TrashIcon width="1em" height="1em" />
      </IconButton>
    </div>
  );
};

export default GraphSettingsControls;
