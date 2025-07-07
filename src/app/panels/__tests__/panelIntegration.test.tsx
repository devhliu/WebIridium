import { test, expect, afterEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { renderWithinWorkspace } from "@/testing-utils/render";
import userEvent from "@testing-library/user-event";

import {
  setWorkerResponseDelay,
  resetWorkerResponseDelay,
} from "@/testing-utils/mockWorker";

import TimeCoursePanel from "../simulation/TimeCoursePanel";
import SteadyStatePanel from "../simulation/SteadyStatePanel";
import ParameterScanPanel from "../simulation/ParameterScanPanel";
import App from "@/app/App";

vi.mock("@/features/workers");
vi.mock("react-plotly.js");
vi.mock("plotly.js");

afterEach(() => {
  resetWorkerResponseDelay();
});

test("panels should all be cancellable when a simulation is running", async () => {
  renderWithinWorkspace(
    <div>
      <TimeCoursePanel visible />
      <SteadyStatePanel visible />
      <ParameterScanPanel visible />
    </div>,
  );

  setWorkerResponseDelay(100);

  const timeCoursePanel = screen.getByTestId("timeCoursePanel");
  const steadyStatePanel = screen.getByTestId("steadyStatePanel");
  const parameterScanPanel = screen.getByTestId("parameterScanPanel");

  const simulateTimeCourseButton =
    within(timeCoursePanel).getByText("Simulate");
  const computeSteadyStateButton =
    within(steadyStatePanel).getByText("Compute");
  const runParameterScanButton = within(parameterScanPanel).getByText("Run");

  await userEvent.click(simulateTimeCourseButton);

  expect(simulateTimeCourseButton).toBeDisabled();
  expect(computeSteadyStateButton).toBeDisabled();
  expect(runParameterScanButton).toBeDisabled();

  const cancelButton = within(timeCoursePanel).getByLabelText("Cancel");
  expect(cancelButton).toBeInTheDocument();
  expect(
    within(steadyStatePanel).queryByLabelText("Cancel"),
  ).toBeInTheDocument();
  expect(
    within(parameterScanPanel).queryByLabelText("Cancel"),
  ).toBeInTheDocument();

  await userEvent.click(cancelButton);

  expect(simulateTimeCourseButton).toBeEnabled();
  expect(computeSteadyStateButton).toBeEnabled();
  expect(runParameterScanButton).toBeEnabled();
});

test("results panel should only be visible after simulating", async () => {
  render(<App />);

  // the view as table button should not be there yet
  expect(screen.queryByText("Table")).not.toBeInTheDocument();

  const simulateButton = screen.getByText("Simulate");
  await userEvent.click(simulateButton);

  expect(screen.getByText("Table")).toBeInTheDocument();
});
