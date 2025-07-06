import styles from "./PropertyList.module.css";
import NumberBox from "../input/NumberBox";

export interface NumericPropertyProps {
  name: string;
  value: number;
  onChange: (newValue: number) => void;
  /** checks for if the value the user is inputted is correct */
  validator?: (value: number) => void;
}

const NumericProperty = ({
  name,
  value,
  onChange,
  validator,
}: NumericPropertyProps) => {
  return (
    <div className={styles.property}>
      <label htmlFor={name} className={styles.propertyName}>
        {name}
      </label>

      <NumberBox
        className={styles.propertyInput}
        name={name}
        value={value}
        onChange={onChange}
        validator={validator}
      />
    </div>
  );
};

export default NumericProperty;
