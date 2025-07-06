import clsx from "clsx";
import styles from "./PropertyList.module.css";
import Slider from "@/components/input/Slider";

export interface NumericSliderPropertyProps {
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (newValue: number) => void;
}

const NumericSliderProperty = ({
  name,
  value,
  min,
  max,
  step,
  onChange,
}: NumericSliderPropertyProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = +e.target.value;
    if (!Number.isNaN(number) && min <= number && number <= max) {
      onChange(number);
    }
  };

  return (
    <div className={styles.property}>
      <label htmlFor={name} className={styles.propertyName}>
        {name}
      </label>

      <input
        id={name}
        className={clsx([styles.propertyInput, styles.secondary])}
        type="number"
        value={value}
        step={step}
        onChange={handleChange}
      />

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  );
};

export default NumericSliderProperty;
