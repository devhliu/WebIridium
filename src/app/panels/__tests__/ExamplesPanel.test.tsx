import { it, expect, vi, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { renderWithinWorkspace } from "@/testing-utils/render";
import { exampleFormattedNames, examplePresets } from "@/features/examples";

import TimeCoursePanel from "../simulation/TimeCoursePanel";
import ExamplesPanel from "../ExamplesPanel";
import userEvent from "@testing-library/user-event";
import {
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
} from "@/testing-utils/mockWorker";

const JANA_WOLF_MODEL_NAME = "jana-wolf-glycolytic-model";
const JANA_WOLF_PRESETS = examplePresets[JANA_WOLF_MODEL_NAME];

const BISTABLE_MODEL_NAME = "simple-bistable-model";

afterEach(() => {
  resetWorkerResponseDelay();
});

const renderExamples = async () => {
  await renderWithinWorkspace(
    <div>
      <TimeCoursePanel
        visible
        slidersPanelActive={false}
        onSlidersPanelToggle={vi.fn()}
      />
      <ExamplesPanel visible />
    </div>,
  );
};

it("should update simulation parameters with presets", async () => {
  await renderExamples();

  setWorkerResponseDelay(50);

  const janaWolfButton = screen.getByRole("button", {
    name: exampleFormattedNames[JANA_WOLF_MODEL_NAME],
  });
  await userEvent.click(janaWolfButton);

  expect(janaWolfButton).toBeDisabled();

  await waitFor(() => {
    expect(screen.getByLabelText("Start Time")).toHaveValue(
      JANA_WOLF_PRESETS.parameters.startTime,
    );
  });
  await waitFor(() => {
    expect(screen.getByLabelText("End Time")).toHaveValue(
      JANA_WOLF_PRESETS.parameters.endTime,
    );
  });
  await waitFor(() => {
    expect(screen.getByLabelText("Number of Points")).toHaveValue(
      JANA_WOLF_PRESETS.parameters.numberOfPoints,
    );
  });
});

it("should make run the latest clicked example when multiple are clicked", async () => {
  await renderExamples();

  setWorkerResponseDelay(50);

  const janaWolfButton = screen.getByRole("button", {
    name: exampleFormattedNames[JANA_WOLF_MODEL_NAME],
  });

  const bistableButton = screen.getByRole("button", {
    name: exampleFormattedNames[BISTABLE_MODEL_NAME],
  });

  await userEvent.click(janaWolfButton);

  expect(janaWolfButton).toBeDisabled();
  expect(bistableButton).toBeEnabled();

  await userEvent.click(bistableButton);

  expect(janaWolfButton).toBeEnabled();
  expect(bistableButton).toBeDisabled();
});
