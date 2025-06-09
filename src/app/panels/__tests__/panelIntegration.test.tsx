import { test, expect, afterEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithinWorkspace } from "@/testing-utils/render";
import TimeCoursePanel from "../simulation/TimeCoursePanel";
import SteadyStatePanel from "../simulation/SteadyStatePanel";
import ParameterScanPanel from "../simulation/ParameterScanPanel";
import userEvent from "@testing-library/user-event";
import {
  setWorkerResponseDelay,
  resetWorkerResponseDelay,
} from "@/testing-utils/mockWorker";

vi.mock("@/features/workers");

afterEach(() => {
  resetWorkerResponseDelay();
});

test("only panel that is currently simulating should be cancellable", async () => {
  setWorkerResponseDelay(100);

  renderWithinWorkspace(
    <div>
      <TimeCoursePanel visible />
      <SteadyStatePanel visible />
      <ParameterScanPanel visible />
    </div>,
  );

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
  ).not.toBeInTheDocument();
  expect(
    within(parameterScanPanel).queryByLabelText("Cancel"),
  ).not.toBeInTheDocument();

  await userEvent.click(cancelButton);
  expect(simulateTimeCourseButton).toBeEnabled();
  expect(computeSteadyStateButton).toBeEnabled();
  expect(runParameterScanButton).toBeEnabled();
});
