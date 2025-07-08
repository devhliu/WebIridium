import clsx from "clsx";
import { Checkbox as RadixCheckbox } from "radix-ui";
import styles from "./Checkbox.module.css";
import CheckIcon from "@/assets/icons/CheckIcon.svg?react";
import DashIcon from "@/assets/icons/DashIcon.svg?react";

export interface CheckboxProps {
  name: string;
  value: boolean | "indeterminate";
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
        {value === "indeterminate" ? (
          <DashIcon width="0.75em" height="0.75em" aria-hidden />
        ) : value === true ? (
          <CheckIcon width="0.75em" height="0.75em" aria-hidden />
        ) : null}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
};

export default Checkbox;
