import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import styles from "./ToggleGroup.module.css";
import clsx from "clsx";

export interface ToggleGroupButtonProps {
  value: string;
  children: React.ReactNode;
}

export const ToggleGroupButton = ({
  value,
  children,
}: ToggleGroupButtonProps) => {
  return (
    <RadixToggleGroup.Item className={styles.button} value={value}>
      {children}
    </RadixToggleGroup.Item>
  );
};

export interface ToggleGroupProps {
  value: string;
  onValueChange: (newValue: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const ToggleGroup = ({
  value,
  onValueChange,
  children,
  className,
}: ToggleGroupProps) => {
  const handleValueChange = (value: string) => {
    if (value) {
      onValueChange(value);
    }
  };

  return (
    <RadixToggleGroup.Root
      className={clsx(styles.container, className)}
      type="single"
      value={value}
      onValueChange={handleValueChange}
    >
      {children}
    </RadixToggleGroup.Root>
  );
};
