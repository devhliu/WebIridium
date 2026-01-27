import { useAtom, useSetAtom } from "jotai";
import styles from "./GraphSettingsControls.module.css";
import buttonStyles from "@/components/Button.module.css";
import {
  currentGraphPresetAtom,
  CUSTOM_PRESET,
  updateGraphSettingsAtom,
} from "@/globals/settings";
import {
  defaultGraphSettings,
  graphPresets,
  type GraphSettings,
} from "@/features/graphPresets";

import ResetIcon from "@/assets/icons/ResetIcon.svg?react";
import Select from "@/components/input/Select";

const PRESET_OPTIONS = {
  [CUSTOM_PRESET]: CUSTOM_PRESET,
  ...Object.fromEntries(Object.keys(graphPresets).map((name) => [name, name])),
};

const GraphSettingsControls = () => {
  const [currentGraphPreset, setCurrentGraphPreset] = useAtom(
    currentGraphPresetAtom,
  );
  const updateGraphSettings = useSetAtom(updateGraphSettingsAtom);

  return (
    <div className={styles.controls}>
      <label htmlFor="graphPreset" className={styles.presetLabel}>
        Preset
      </label>
      <Select
        name="graphPreset"
        value={currentGraphPreset}
        className={styles.presetSelect}
        options={PRESET_OPTIONS}
        onChange={setCurrentGraphPreset}
      />
      <button
        className={buttonStyles.default}
        onClick={() =>
          updateGraphSettings(
            currentGraphPreset === CUSTOM_PRESET
              ? defaultGraphSettings
              : ((graphPresets as Record<string, GraphSettings>)[
                  currentGraphPreset
                ] ?? defaultGraphSettings),
          )
        }
      >
        <ResetIcon width="1em" height="1em" />
        Reset to Default
      </button>
    </div>
  );
};

export default GraphSettingsControls;
