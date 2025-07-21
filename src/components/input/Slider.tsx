import clsx from "clsx";
import styles from "./Slider.module.css";
import { Slider as RadixSlider } from "radix-ui";

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (newValue: number) => void;

  className?: string;
}

const Slider = ({
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
  className,
}: SliderProps) => {
  return (
    <RadixSlider.Root
      className={clsx(styles.root, className)}
      value={[value]}
      onValueChange={([newValue]) => onChange(newValue)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <RadixSlider.Track className={styles.track}>
        <RadixSlider.Range className={styles.range} />
      </RadixSlider.Track>
      <RadixSlider.Thumb className={styles.thumb} />
    </RadixSlider.Root>
  );
};

export default Slider;
