import { it, expect, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithinWorkspace } from "@/testing-utils/render";
import {
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
} from "@/testing-utils/mockWorker";

import AppStatusBar from "../AppStatusBar";
import TimeCoursePanel from "../panels/simulation/TimeCoursePanel";

afterEach(() => {
  resetWorkerResponseDelay();
});

it("should say Simulating when a simulation is being ran", async () => {
  renderWithinWorkspace(
    <>
      <AppStatusBar />
      <TimeCoursePanel visible />
    </>,
  );

  expect(screen.queryByText("Simulating")).not.toBeInTheDocument();

  const simulateButton = screen.getByText("Simulate");
  await waitFor(() => {
    expect(simulateButton).toBeEnabled();
  });

  setWorkerResponseDelay(1000);

  await userEvent.click(simulateButton);

  expect(screen.getByText("Simulating")).toBeInTheDocument();
});
