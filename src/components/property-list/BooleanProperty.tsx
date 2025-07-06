import styles from "./PropertyList.module.css";
import Checkbox from "../input/Checkbox";

export interface BooleanPropertyProps {
  name: string;
  value: boolean;
  onChange: (newValue: boolean) => void;

  /**
   * By default it looks like this:
   *   property name    [x]
   * in aside mode it looks like this:
   *  [x] property name
   * I don't know what else to call it.
   */
  asideMode?: boolean;
}

const BooleanProperty = ({
  name,
  value,
  onChange,
  asideMode,
}: BooleanPropertyProps) => {
  return (
    <div className={asideMode ? styles.asideProperty : styles.property}>
      <label htmlFor={name} className={styles.propertyName}>
        {name}
      </label>

      <Checkbox name={name} value={value} onChange={onChange} />
    </div>
  );
};

export default BooleanProperty;
