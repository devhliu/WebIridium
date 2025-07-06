import styles from "./SlidersPanel.module.css";
import Slider from "@/components/input/Slider";

const VariableSlider = () => {
  return (
    <div className={styles.sliderContainer}>
      <p className={styles.sliderName}>k1</p>
      <Slider min={0} max={10} step={1} value={5} onChange={() => null} />
    </div>
  );
};

const SlidersPanel = () => {
  return (
    <div className={styles.panel}>
      <div className={styles.sliders}>
        <VariableSlider />
        <VariableSlider />
        <VariableSlider />
        <VariableSlider />
      </div>
    </div>
  );
};

export default SlidersPanel;
