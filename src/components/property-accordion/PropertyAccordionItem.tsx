import clsx from "clsx";
import { Accordion as RadixAccordion } from "radix-ui";
import styles from "./PropertyAccordion.module.css";
import ChevronDownIcon from "@/assets/icons//ChevronDownIcon.svg?react";

export interface AccordionItemProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const AccordionItem = ({ title, children, className }: AccordionItemProps) => {
  return (
    <RadixAccordion.Item value={title}>
      <RadixAccordion.Trigger className={styles.itemTrigger}>
        <ChevronDownIcon />
        {title}
      </RadixAccordion.Trigger>
      <RadixAccordion.Content className={clsx(styles.itemContent, className)}>
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
};

export default AccordionItem;
