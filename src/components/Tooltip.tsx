import styles from "./Tooltip.module.css";
import { Tooltip as RadixTooltip } from "radix-ui";

export interface TooltipProviderProps {
  children: React.ReactNode;
}

export const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return (
    <RadixTooltip.Provider delayDuration={500}>
      {children}
    </RadixTooltip.Provider>
  );
};

export interface TooltipProps {
  text: string;
  side?: RadixTooltip.TooltipContentProps["side"];
  children: React.ReactNode;
}

export const Tooltip = ({ text, side = "bottom", children }: TooltipProps) => {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={styles.content}
          side={side}
          sideOffset={4}
        >
          {text}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};
