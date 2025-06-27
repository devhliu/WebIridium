import { it, afterEach, expect } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import {
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
} from "@/testing-utils/mockWorker.ts";

afterEach(() => {
  resetWorkerResponseDelay();
});

export interface TestSimulationButtonOptions {
  buttonText: string;
  hasPlot: boolean;
}

/**
 * Utility function to test if a simulation button works.
 * @param buttonText - text that appears on the button
 * @param render - renders the panel containing the button and plot panel
 *
 * @remarks
 * make sure to mock everything required to get a simulation to run in the test
 * environment
 */
export const testSimulationButton = (
  { buttonText, hasPlot }: TestSimulationButtonOptions,
  render: () => void,
) => {
  it("should disable when starting a simulation", async () => {
    // need to have some delay otherwise the button will instantly simulate and undisable itself

    render();

    // This has to go after the render because the model info update
    // also goes through a worker round-trip. The button will refuse
    // to run a simulation if there is no parameter to scan with.
    setWorkerResponseDelay(100);

    const button = screen.getByText(buttonText);
    await userEvent.click(button);
    expect(button).toBeDisabled();
  });

  if (hasPlot) {
    it("should cause a plot to display in the plot panel", async () => {
      render();

      const button = screen.getByText(buttonText);
      await userEvent.click(button);
      expect(screen.getByTestId("results-plot")).toBeInTheDocument();
    });
  }

  it("should be cancellable", async () => {
    render();

    setWorkerResponseDelay(100);

    const button = screen.getByText(buttonText);
    await userEvent.click(button);

    const cancel = screen.getByLabelText("Cancel");
    await userEvent.click(cancel);

    expect(button).toBeEnabled();
    expect(cancel).not.toBeInTheDocument();
    expect(screen.queryByTestId("results-plot")).not.toBeInTheDocument();
  });
};
