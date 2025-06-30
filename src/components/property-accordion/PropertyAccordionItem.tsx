import { Accordion as RadixAccordion } from "radix-ui";
import styles from "./PropertyAccordion.module.css";
import ChevronDownIcon from "@/assets/icons//ChevronDownIcon.svg?react";

export interface AccordionItemProps {
  title: string;
  children?: React.ReactNode;
}

const AccordionItem = ({ title, children }: AccordionItemProps) => {
  return (
    <RadixAccordion.Item value={title}>
      <RadixAccordion.Trigger className={styles.itemTrigger}>
        <ChevronDownIcon />
        {title}
      </RadixAccordion.Trigger>
      <RadixAccordion.Content className={styles.itemContent}>
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
};

export default AccordionItem;
