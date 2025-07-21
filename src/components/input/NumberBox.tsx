import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import styles from "./NumberBox.module.css";

export interface NumberBoxProps {
  name: string;
  value: number;
  disabled?: boolean;
  onChange: (newValue: number) => void;
  /** checks for if the value the user is inputted is correct */
  validator?: (value: number) => void;
  className?: string;
}

const NumberBox = ({
  name,
  value,
  disabled = false,
  onChange,
  validator,
  className,
}: NumberBoxProps) => {
  // user has a working value, once they end the input, check if its a valid number
  // restore to original value if not
  const [workingValue, setWorkingValue] = useState(value.toString());
  const lastValueRef = useRef(value.toString());

  useEffect(() => {
    setWorkingValue(value.toString());
  }, [value]);

  const handleFocus = () => {
    lastValueRef.current = workingValue;
  };

  const handleWorkingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkingValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = +value;
    if (
      value !== "" &&
      !Number.isNaN(numericValue) &&
      (!validator || validator(numericValue))
    ) {
      onChange(numericValue);
    } else {
      setWorkingValue(lastValueRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      id={name}
      className={clsx(styles.box, className)}
      type="number"
      value={workingValue}
      disabled={disabled}
      onFocus={handleFocus}
      onChange={handleWorkingChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

export default NumberBox;
