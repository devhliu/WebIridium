import clsx from "clsx";
import { Select as RadixSelect } from "radix-ui";
import styles from "./Select.module.css";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon.svg?react";
import CheckIcon from "@/assets/icons/CheckIcon.svg?react";

export type SelectBaseProps = {
  name: string;
  value: string;
  onChange: (newValue: string) => void;
  className?: string;

  "aria-label"?: string;
};

export type SelectFlatProps = SelectBaseProps & {
  // display name -> value
  options: { [name: string]: string };
};

export type SelectGroupedProps = SelectBaseProps & {
  // group name -> display name -> value
  groups: { [group: string]: { [name: string]: string } };
};

export type SelectProps = SelectFlatProps | SelectGroupedProps;

const SelectItem = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  return (
    <RadixSelect.Item value={value} className={styles.item}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
};

const Select = (props: SelectProps) => {
  const { name, value, onChange, className, "aria-label": ariaLabel } = props;

  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        id={name}
        className={clsx(className, styles.trigger)}
        aria-label={ariaLabel}
        data-value={value} // this is used for testing b/c I couldn't find any other way to get the value externally
      >
        <RadixSelect.Value placeholder={name} />
        <RadixSelect.Icon className={styles.triggerIcon}>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className={styles.content}>
          <RadixSelect.ScrollUpButton
            className={styles.scrollButton}
            style={{ transform: "rotate(180deg)" }}
          >
            <ChevronDownIcon />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport>
            {"options" in props &&
              Object.entries(props.options).map(([name, value]) => (
                <SelectItem key={value} value={value}>
                  {name}
                </SelectItem>
              ))}

            {"groups" in props &&
              Object.entries(props.groups).map(([group, options]) => (
                <RadixSelect.Group key={group}>
                  <RadixSelect.Label className={styles.label}>
                    {group}
                  </RadixSelect.Label>
                  {Object.entries(options).map(([name, value]) => (
                    <SelectItem key={value} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </RadixSelect.Group>
              ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className={styles.scrollButton}>
            <ChevronDownIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;
