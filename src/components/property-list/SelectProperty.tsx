import styles from "./PropertyList.module.css";
import Select, { type SelectProps } from "@/components/input/Select";

const SelectProperty = (props: SelectProps) => {
  const { name } = props;

  return (
    <div className={styles.property}>
      <label htmlFor={name} className={styles.propertyName}>
        {name}
      </label>

      <Select
        {...props}
        className={styles.propertyInput}
      />
    </div>
  );
};

export default SelectProperty;
