import { ToastProvider } from "@/components/Toast";
import { WorkspaceProvider } from "@/features/workspace";
import { render } from "@testing-library/react";

/**
 * Same as testing-library's render function, additionally wrapping stores so they don't persist between tests.
 */
export const renderWithinWorkspace = (node: React.ReactNode) => {
  return render(
    <ToastProvider>
      <WorkspaceProvider>{node}</WorkspaceProvider>
    </ToastProvider>,
  );
};
