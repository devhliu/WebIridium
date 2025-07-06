import { Checkbox as RadixCheckbox } from "radix-ui";
import styles from "./Checkbox.module.css";
import CheckIcon from "@/assets/icons//CheckIcon.svg?react";
import clsx from "clsx";

export interface CheckboxProps {
  name: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
  className?: string;
}

const Checkbox = ({ name, value, onChange, className }: CheckboxProps) => {
  return (
    <RadixCheckbox.Root
      id={name}
      className={clsx(styles.root, className)}
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
