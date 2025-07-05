import { describe, vi } from "vitest";
import { renderWithinWorkspace } from "@/testing-utils/render.tsx";
import SteadyStatePanel from "../simulation/SteadyStatePanel.tsx";
import PlotPanel from "../results/PlotPanel.tsx";
import {
  itShouldDisableWhenStartingSimulation,
  itShouldBeCancellable,
  itShouldDisplayPlot,
  itShouldDisplayToasts,
} from "./testButton.ts";

vi.mock("@/features/workers.ts");
vi.mock("@/components/Toast.tsx");
vi.mock("react-plotly.js");
vi.mock("plotly.js");

describe("compute button", () => {
  const testButtonOptions = {
    buttonText: "Compute",
    render: () => {
      renderWithinWorkspace(
        <div>
          <SteadyStatePanel visible />
          <PlotPanel />
        </div>,
      );
    },
  };

  itShouldDisableWhenStartingSimulation(testButtonOptions);
  itShouldBeCancellable(testButtonOptions);
  itShouldDisplayPlot(testButtonOptions);
  itShouldDisplayToasts(testButtonOptions);

  // TODO: need tests to see if the plot display is correct.
  // TODO: need test to see if simple setting updates are working correctly
});
