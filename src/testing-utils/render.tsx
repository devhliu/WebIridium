/* eslint-disable react-refresh/only-export-components */

import { useRef } from "react";
import { render } from "@testing-library/react";
import { ToastProvider } from "@/components/Toast";
import { TooltipProvider } from "@/components/Tooltip";
import WorkspaceProvider from "@/app/WorkspaceProvider";

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
export const renderWithinWorkspace = (node: React.ReactNode) => {
  render(<TestApp>{node}</TestApp>);
};
