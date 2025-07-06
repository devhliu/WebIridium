import { Checkbox as RadixCheckbox } from "radix-ui";
import styles from "./Checkbox.module.css";
import CheckIcon from "@/assets/icons//CheckIcon.svg?react";

export interface CheckboxProps {
  name: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

const Checkbox = ({ name, value, onChange }: CheckboxProps) => {
  return (
      <RadixCheckbox.Root
        id={name}
        className={styles.root}
        checked={value}
        onCheckedChange={onChange}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>
          {value && <CheckIcon aria-hidden />}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    );
};

export default Checkbox;
