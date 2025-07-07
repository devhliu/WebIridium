import { describe, vi } from "vitest";
import { renderWithinWorkspace } from "@/testing-utils/render.tsx";
import PlotPanel from "../results/PlotPanel.tsx";
import {
  itShouldDisableWhenStartingSimulation,
  itShouldBeCancellable,
  itShouldDisplayPlot,
  itShouldBeLoadingWhenModelIsLoading,
  ForceModelUpdateButton,
} from "./testButton";
import ParameterScanPanel from "../simulation/ParameterScanPanel.tsx";

vi.mock("@/features/workers.ts");
vi.mock("@/components/Toast.tsx");
vi.mock("react-plotly.js");
vi.mock("plotly.js");

describe("run button", () => {
  const testButtonOptions = {
    buttonText: "Run",
    render: async () => {
      await renderWithinWorkspace(
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
  itShouldBeLoadingWhenModelIsLoading({
    render: async () => {
      await renderWithinWorkspace(
        <div>
          <ParameterScanPanel visible />
          <ForceModelUpdateButton />
          <PlotPanel />
        </div>,
      );
    },
  });

  // TODO: need tests to see if the plot display is correct
  // TODO: need test to see if simple setting updates are working correctly
});
