import { describe, vi } from "vitest";
import { renderWithinWorkspace } from "@/testing-utils/render.tsx";
import SteadyStatePanel from "../simulation/SteadyStatePanel.tsx";
import PlotPanel from "../results/PlotPanel.tsx";
import {
  itShouldDisableWhenStartingSimulation,
  itShouldBeCancellable,
  itShouldDisplayToasts,
  itShouldBeLoadingWhenModelIsLoading,
  ForceModelUpdateButton,
} from "./testButton";

describe("compute button", () => {
  const testButtonOptions = {
    buttonText: "Compute",
    render: async () => {
      await renderWithinWorkspace(
        <div>
          <SteadyStatePanel
            visible
            slidersPanelActive={false}
            onSlidersPanelToggle={vi.fn()}
          />
          <PlotPanel />
        </div>,
      );
    },
  };

  itShouldDisableWhenStartingSimulation(testButtonOptions);
  itShouldBeCancellable(testButtonOptions);
  itShouldDisplayToasts(testButtonOptions);
  itShouldBeLoadingWhenModelIsLoading({
    ...testButtonOptions,
    render: async () => {
      await renderWithinWorkspace(
        <div>
          <SteadyStatePanel
            visible
            slidersPanelActive={false}
            onSlidersPanelToggle={vi.fn()}
          />
          <ForceModelUpdateButton />
          <PlotPanel />
        </div>,
      );
    },
  });

  // TODO: need tests to see if the plot display is correct.
  // TODO: need test to see if simple setting updates are working correctly
});
