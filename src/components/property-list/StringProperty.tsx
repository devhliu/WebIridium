import clsx from "clsx";
import styles from "./PropertyList.module.css";

export interface StringPropertyProps {
  name: string;
  value: string;
  placeholder?: string;
  onChange: (newValue: string) => void;

  /**
   * In long mode, the input appears in its own row to maximize its width .*/
  longMode?: boolean;
}

const StringProperty = ({
  name,
  value,
  placeholder,
  onChange,
  longMode: isLongMode = false,
}: StringPropertyProps) => {
  return (
    <div className={clsx(styles.property, isLongMode && styles.longProperty)}>
      <label htmlFor={name} className={styles.propertyName}>
        {name}
      </label>

      <input
        id={name}
        className={styles.propertyInput}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default StringProperty;
