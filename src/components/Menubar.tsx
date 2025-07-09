import clsx from "clsx";
import styles from "./Menubar.module.css";
import { Menubar as RadixMenubar } from "radix-ui";

import DotFilledIcon from "@/assets/icons/DotFilledIcon.svg?react";
import CheckIcon from "@/assets/icons/CheckIcon.svg?react";

export const MenubarRoot = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <RadixMenubar.Root className={clsx(styles.root, className)}>
      {children}
    </RadixMenubar.Root>
  );
};

export const MenubarMenu = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => {
  return (
    <RadixMenubar.Menu>
      <RadixMenubar.Trigger className={styles.trigger}>
        {name}
      </RadixMenubar.Trigger>
      <RadixMenubar.Portal>
        <RadixMenubar.Content
          className={styles.content}
          align="start"
          sideOffset={3}
          alignOffset={-2}
        >
          {children}
        </RadixMenubar.Content>
      </RadixMenubar.Portal>
    </RadixMenubar.Menu>
  );
};

export const MenubarItem = ({
  name,
  onSelect,
}: {
  name: string;
  onSelect: () => void;
}) => {
  return (
    <RadixMenubar.Item className={styles.item} onSelect={onSelect}>
      {name}
    </RadixMenubar.Item>
  );
};

export const MenubarRadioGroup = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (newValue: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <RadixMenubar.RadioGroup
      className={styles.radioGroup}
      value={value}
      onValueChange={onValueChange}
    >
      {children}
    </RadixMenubar.RadioGroup>
  );
};

export const MenubarRadioItem = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  return (
    <RadixMenubar.RadioItem className={styles.item} value={value}>
      <RadixMenubar.ItemIndicator className={styles.itemIndicator}>
        <DotFilledIcon />
      </RadixMenubar.ItemIndicator>
      {children}
    </RadixMenubar.RadioItem>
  );
};

export const MenubarCheckboxItem = ({
  checked,
  onCheckedChange,
  children,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <RadixMenubar.CheckboxItem
      className={styles.item}
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <RadixMenubar.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </RadixMenubar.ItemIndicator>
      {children}
    </RadixMenubar.CheckboxItem>
  );
};

export const MenubarSeparator = () => {
  return <RadixMenubar.Separator className={styles.separator} />;
};
