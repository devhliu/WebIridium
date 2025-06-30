import { Accordion as RadixAccordion } from "radix-ui";
import styles from "./PropertyAccordion.module.css";

export interface AccordionProps {
  defaultOpen: string[];
  children: React.ReactNode;
}

const Accordion = ({ defaultOpen, children }: AccordionProps) => {
  return (
    <RadixAccordion.Root
      className={styles.accordion}
      type="multiple"
      defaultValue={defaultOpen}
    >
      {children}
    </RadixAccordion.Root>
  );
};

export default Accordion;
