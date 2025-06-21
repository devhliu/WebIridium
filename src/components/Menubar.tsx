import clsx from "clsx";
import { Menubar as RadixMenubar } from "radix-ui";
import styles from "./Menubar.module.css";

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
          sideOffset={6}
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
