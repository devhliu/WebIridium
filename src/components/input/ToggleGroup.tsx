import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import styles from "./ToggleGroup.module.css";
import clsx from "clsx";

export interface ToggleGroupProps {
  value: string;
  children: React.ReactNode;
}

export const ToggleGroupButton = ({ value, children }: ToggleGroupProps) => {
  return (
    <RadixToggleGroup.Item className={styles.button} value={value}>
      {children}
    </RadixToggleGroup.Item>
  );
};

export interface ToggleGroupContainerProps {
  value: string;
  onValueChange: (newValue: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const ToggleGroupContainer = ({
  value,
  onValueChange,
  children,
  className,
}: ToggleGroupContainerProps) => {
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
