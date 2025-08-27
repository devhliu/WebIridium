/* eslint-disable react-refresh/only-export-components */

import { useRef } from "react";
import { render } from "@testing-library/react";
import { ToastProvider } from "@/components/Toast";
import { TooltipProvider } from "@/components/Tooltip";
import WorkspaceProvider from "@/app/WorkspaceProvider";

/**
 * Renders then waits for microtask queue to clear.
 * This is useful for making sure all the promises for things like model info
 * get ran.
 */
export const renderFlush = async (node: React.ReactNode) => {
  render(node);
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const TestApp = ({ children }: { children: React.ReactNode }) => {
  const didInitialLoadRef = useRef(false);
  return (
    <TooltipProvider>
      <ToastProvider>
        <WorkspaceProvider didInitialLoadRef={didInitialLoadRef}>
          {children}
        </WorkspaceProvider>
      </ToastProvider>
    </TooltipProvider>
  );
};

/**
 * Same as testing-library's render function, additionally wrapping stores so they don't persist between tests.
 */
export const renderWithinWorkspace = async (node: React.ReactNode) => {
  await renderFlush(<TestApp>{node}</TestApp>);
};
