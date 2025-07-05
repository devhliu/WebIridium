import { describe, vi } from "vitest";
import { renderWithinWorkspace } from "@/testing-utils/render.tsx";
import PlotPanel from "../results/PlotPanel.tsx";
import {
  itShouldDisableWhenStartingSimulation,
  itShouldBeCancellable,
  itShouldDisplayPlot,
} from "./testButton.ts";
import ParameterScanPanel from "../simulation/ParameterScanPanel.tsx";

vi.mock("@/features/workers.ts");
vi.mock("@/components/Toast.tsx");
vi.mock("react-plotly.js");
vi.mock("plotly.js");

describe("run button", () => {
  const testButtonOptions = {
    buttonText: "Run",
    render: () => {
      renderWithinWorkspace(
        <div>
          <ParameterScanPanel visible />
          <PlotPanel />
        </div>,
      );
    },
  };

  itShouldDisableWhenStartingSimulation(testButtonOptions);
  itShouldBeCancellable(testButtonOptions);
  itShouldDisplayPlot(testButtonOptions);

  // TODO: need tests to see if the plot display is correct
  // TODO: need test to see if simple setting updates are working correctly
});
