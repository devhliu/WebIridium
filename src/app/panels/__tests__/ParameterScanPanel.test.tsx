import { describe, vi } from "vitest";
import { renderWithinWorkspace } from "@/testing-utils/render.tsx";
import PlotPanel from "../results/PlotPanel.tsx";
import { testSimulationButton } from "./testButton.tsx";
import ParameterScanPanel from "../simulation/ParameterScanPanel.tsx";
import AntimonyEditorPanel from "../AntimonyEditorPanel.tsx";

vi.mock("@/features/workers.ts");
vi.mock("@/components/Toast.tsx");
vi.mock("react-plotly.js");
vi.mock("plotly.js");

describe("run button", () => {
  testSimulationButton(
    {
      buttonText: "Run",
      hasPlot: true,
      shouldTestToasts: false,
    },
    () => {
      renderWithinWorkspace(
        <div>
          <ParameterScanPanel visible />
          {/* This is to get the model data to load */}
          <AntimonyEditorPanel />
          <PlotPanel />
        </div>,
      );
    },
  );

  // TODO: need tests to see if the plot display is correct
  // TODO: need test to see if simple setting updates are working correctly
});
