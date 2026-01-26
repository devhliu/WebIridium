import { useSetAtom } from "jotai";
import styles from "./GraphSettingsControls.module.css";
import buttonStyles from "@/components/Button.module.css";
import { updateGraphSettingsAtom } from "@/globals/settings";
import { defaultGraphSettings } from "@/features/graphPresets";

import ResetIcon from "@/assets/icons/ResetIcon.svg?react";
import Select from "@/components/input/Select";

const GraphSettingsControls = () => {
  const updateGraphSettings = useSetAtom(updateGraphSettingsAtom);
  return (
    <div className={styles.controls}>
      <label htmlFor="graphPreset" className={styles.presetLabel}>
        Preset
      </label>
      <Select
        name="graphPreset"
        value="Custom"
        className={styles.presetSelect}
        options={{ Custom: "Custom" }}
        onChange={() => null}
      />
      <button
        className={buttonStyles.default}
        onClick={() => updateGraphSettings(defaultGraphSettings)}
      >
        <ResetIcon width="1em" height="1em" />
        Reset to Default
      </button>
    </div>
  );
};

export default GraphSettingsControls;
