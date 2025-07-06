import styles from "./SlidersPanel.module.css";
import type { Variable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/stores/workspace";
import Slider from "@/components/input/Slider";
import Checkbox from "@/components/input/Checkbox";

export interface VariableSliderProps {
  variable: Variable,
  settings: VariableSettings,
}

const VariableSlider = ({ variable, settings }: VariableSliderProps) => {
  return (
    <div className={styles.sliderContainer}>
      <p className={styles.sliderTitle}>
        {/* TODO: what should the checkbox's name/id really be? */}
        <Checkbox className={styles.sliderCheckbox} name={variable.name} value={true} onChange={() => null} />
        <span>{settings.displayName}</span>
      </p>
      <Slider min={0} max={10} step={1} value={5} onChange={() => null} />
    </div>
  );
};

export default VariableSlider;
