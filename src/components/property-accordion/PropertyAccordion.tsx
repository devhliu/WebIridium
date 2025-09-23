import { Accordion as RadixAccordion } from "radix-ui";
import styles from "./PropertyAccordion.module.css";

export interface AccordionProps {
  defaultOpen?: string[];
  children: React.ReactNode;

  /* if not using defaultOpen, use this to control which are open */
  open?: string[];
  onOpenChange?: (newOpen: string[]) => void;
}

const Accordion = ({
  defaultOpen,
  children,
  open,
  onOpenChange,
}: AccordionProps) => {
  return (
    <RadixAccordion.Root
      className={styles.accordion}
      type="multiple"
      defaultValue={defaultOpen}
      value={open}
      onValueChange={onOpenChange}
    >
      {children}
    </RadixAccordion.Root>
  );
};

export default Accordion;
