import { describe, vi } from "vitest";
import { renderWithinWorkspace } from "@/testing-utils/render.tsx";
import PlotPanel from "../results/PlotPanel.tsx";
import { testSimulationButton } from "./testButton.tsx";
import ParameterScanPanel from "../simulation/ParameterScanPanel.tsx";

vi.mock("@/features/workers.ts");
vi.mock("react-plotly.js");
vi.mock("plotly.js");

describe("run button", () => {
  testSimulationButton("Run", () => {
    renderWithinWorkspace(
      <div>
        <ParameterScanPanel visible />
        <PlotPanel />
      </div>,
    );
  });

  // TODO: need tests to see if the plot display is correct
  // TODO: need test to see if simple setting updates are working correctly
});
