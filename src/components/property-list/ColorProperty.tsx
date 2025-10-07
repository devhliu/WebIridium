import clsx from "clsx";
import { useState, useRef } from "react";
import { Popover as RadixPopover } from "radix-ui";
import { HexColorPicker } from "react-colorful";
import styles from "./PropertyList.module.css";

export interface ColorPropertyProps {
  name: string;
  value: string;
  onChange: (newValue: string) => void;
}

const isValidColor = (color: string): boolean => {
  if (!color || color.trim() === "") return false;
  const style = new Option().style;
  style.color = color;
  return style.color !== "";
};

// TODO: fix the color box being slightly larger than the input box for numeric slider
const ColorProperty = ({ name, value, onChange }: ColorPropertyProps) => {
  const [workingValue, setWorkingValue] = useState(value);
  const lastValidValueRef = useRef(value);

  const handleInputChange = (inputValue: string) => {
    setWorkingValue(inputValue);

    if (isValidColor(inputValue)) {
      lastValidValueRef.current = inputValue;
      onChange(inputValue);
    }
  };

  const handleInputBlur = () => {
    if (!isValidColor(workingValue)) {
      setWorkingValue(lastValidValueRef.current);
    }
  };

  const isInvalid =
    !isValidColor(workingValue) && workingValue !== lastValidValueRef.current;

  return (
    <div className={styles.property}>
      <label htmlFor={name} className={styles.propertyName}>
        {name}
      </label>

      <RadixPopover.Root>
        <RadixPopover.Trigger asChild>
          <button
            className={clsx(styles.colorButton, styles.secondary)}
            style={{ backgroundColor: value }}
            aria-label="Open color picker"
          />
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content className={styles.colorPopup}>
            <HexColorPicker color={value} onChange={onChange} />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>

      <input
        id={name}
        className={clsx(styles.propertyInput, {
          [styles.invalid]: isInvalid,
        })}
        value={workingValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
      />
    </div>
  );
};

export default ColorProperty;
