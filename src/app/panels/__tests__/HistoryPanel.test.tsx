import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useAtomValue } from "jotai";

import { renderWithinWorkspace } from "@/testing-utils/render";

import HistoryPanel from "../HistoryPanel";
import TimeCoursePanel from "../simulation/TimeCoursePanel";
import SteadyStatePanel from "../simulation/SteadyStatePanel";
import ParameterScanPanel from "../simulation/ParameterScanPanel";

import { simulationResultAtom } from "@/globals/workspace/simulation";
import type { SimulationResult } from "@/features/simulation/Simulator";

const getResultTypeText = (type: SimulationResult["type"] | undefined) =>
  `RESULT TYPE: ${type ?? "none"}`;

/**
 * Helper component to show the type of the current result.
 */
const ResultTypeComponent = () => {
  const result = useAtomValue(simulationResultAtom);
  return <p>{getResultTypeText(result?.type)}</p>;
};

afterEach(() => {
  vi.useRealTimers();
});

describe("the panel", () => {
  it("should show history records", async () => {
    renderWithinWorkspace(
      <div>
        <TimeCoursePanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    // record shouldn't be added yet
    expect(
      within(historyPanel).queryByText("Time Course Simulation"),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Simulate"));

    // now the record should be there
    expect(
      within(historyPanel).getByText("Time Course Simulation"),
    ).toBeInTheDocument();
  });

  it("should show time since the record was made", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval"] });

    renderWithinWorkspace(
      <div>
        <TimeCoursePanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    // record shouldn't be added yet
    expect(
      within(historyPanel).queryByText("Time Course Simulation"),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Simulate"));

    await vi.advanceTimersByTimeAsync(3600 * 1000 + 100);

    expect(within(historyPanel).getByText("1 hour ago")).toBeInTheDocument();
  });

  it("should update result when clicking a record", async () => {
    renderWithinWorkspace(
      <div>
        <TimeCoursePanel visible />
        <SteadyStatePanel visible />
        <HistoryPanel visible />
        <ResultTypeComponent />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    await userEvent.click(screen.getByText("Simulate"));
    expect(
      screen.getByText(getResultTypeText("timeCourse")),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("Compute"));
    expect(
      screen.getByText(getResultTypeText("steadyState")),
    ).toBeInTheDocument();

    // find the history record and click it
    const firstRecord = within(historyPanel).getByText(
      "Time Course Simulation",
    );
    await userEvent.click(firstRecord);

    expect(
      within(historyPanel).getByRole("option", { selected: true }),
    ).toHaveTextContent("Time Course Simulation");

    expect(
      screen.getByText(getResultTypeText("timeCourse")),
    ).toBeInTheDocument();
  });
});

describe("history", () => {
  it("should not add records when they are in quick succession and of the same type", async () => {
    renderWithinWorkspace(
      <div>
        <TimeCoursePanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(0);
    await userEvent.click(screen.getByText("Simulate"));

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(1);

    await userEvent.click(screen.getByText("Simulate"));

    // another records should not be added
    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(1);
  });

  it("should add records when they are not in quick succession (1 minute)", async () => {
    renderWithinWorkspace(
      <div>
        <TimeCoursePanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    vi.useFakeTimers({ toFake: ["Date"] });

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(0);

    await userEvent.click(screen.getByText("Simulate"));

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(1);

    vi.advanceTimersByTime(60_000);

    await userEvent.click(screen.getByText("Simulate"));

    // another records should be added
    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(2);
  });

  it("should add records when they are in quick succession and not of the same type", async () => {
    renderWithinWorkspace(
      <div>
        <TimeCoursePanel visible />
        <SteadyStatePanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(0);
    await userEvent.click(screen.getByText("Simulate"));

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(1);

    await userEvent.click(screen.getByText("Compute"));

    expect(
      within(historyPanel).queryAllByText("Time Course Simulation"),
    ).toHaveLength(1);
    expect(
      within(historyPanel).queryAllByText("Steady State Simulation"),
    ).toHaveLength(1);
  });

  it("should not add records when they are in quick succession and of the same mode (parameter scan)", async () => {
    renderWithinWorkspace(
      <div>
        <ParameterScanPanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    expect(
      within(historyPanel).queryAllByText("Time Course Parameter Scan"),
    ).toHaveLength(0);
    await userEvent.click(screen.getByText("Run"));

    expect(
      within(historyPanel).queryAllByText("Time Course Parameter Scan"),
    ).toHaveLength(1);

    await userEvent.click(screen.getByText("Run"));

    // another records should not be added
    expect(
      within(historyPanel).queryAllByText("Time Course Parameter Scan"),
    ).toHaveLength(1);
  });

  it("should add records when they are in quick succession and of the different mode (parameter scan)", async () => {
    renderWithinWorkspace(
      <div>
        <ParameterScanPanel visible />
        <HistoryPanel visible />
      </div>,
    );

    const historyPanel = screen.getByTestId("history-panel");

    expect(
      within(historyPanel).queryAllByText("Time Course Parameter Scan"),
    ).toHaveLength(0);
    await userEvent.click(screen.getByText("Run"));

    expect(
      within(historyPanel).queryAllByText("Time Course Parameter Scan"),
    ).toHaveLength(1);

    // switch to steady state mode
    await userEvent.click(screen.getByText("Steady State"));

    await userEvent.click(screen.getByText("Run"));

    expect(
      within(historyPanel).queryAllByText("Time Course Parameter Scan"),
    ).toHaveLength(1);
    expect(
      within(historyPanel).queryAllByText("Steady State Parameter Scan"),
    ).toHaveLength(1);
  });
});
