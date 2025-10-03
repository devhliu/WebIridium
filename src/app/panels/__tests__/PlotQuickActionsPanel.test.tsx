import { it, expect } from "vitest";
import { useAtomValue } from "jotai";

import { currentVeryRightPanelAtom } from "@/globals/workspace/layout";
import { renderWithinWorkspace } from "@/testing-utils/render";
import PlotQuickActionsPanel from "../results/PlotQuickActionsPanel";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

it("should let you toggle plot settings", async () => {
  const ITS_OPEN_TEXT = "ITS OPEN!";
  const ITS_CLOSE_TEXT = "ITS CLOSED!";
  const PlotSettingsTestComponent = () => {
    const currentVeryRightPanel = useAtomValue(currentVeryRightPanelAtom);
    return currentVeryRightPanel === "Plot Settings" ? (
      <p>{ITS_OPEN_TEXT}</p>
    ) : (
      <p>{ITS_CLOSE_TEXT}</p>
    );
  };

  await renderWithinWorkspace(
    <>
      <PlotSettingsTestComponent />
      <PlotQuickActionsPanel />
    </>,
  );

  expect(screen.getByText(ITS_CLOSE_TEXT)).toBeInTheDocument();

  await userEvent.click(screen.getByText("Edit Graph"));

  expect(screen.getByText(ITS_OPEN_TEXT)).toBeInTheDocument();

  await userEvent.click(screen.getByText("Close Settings"));

  expect(screen.getByText(ITS_CLOSE_TEXT)).toBeInTheDocument();
});

it("should let you toggle overlays", async () => {
  const ITS_OPEN_TEXT = "ITS OPEN!";
  const ITS_CLOSE_TEXT = "ITS CLOSED!";
  const PlotSettingsTestComponent = () => {
    const currentVeryRightPanel = useAtomValue(currentVeryRightPanelAtom);
    return currentVeryRightPanel === "Overlays" ? (
      <p>{ITS_OPEN_TEXT}</p>
    ) : (
      <p>{ITS_CLOSE_TEXT}</p>
    );
  };

  await renderWithinWorkspace(
    <>
      <PlotSettingsTestComponent />
      <PlotQuickActionsPanel />
    </>,
  );

  expect(screen.getByText(ITS_CLOSE_TEXT)).toBeInTheDocument();

  await userEvent.click(screen.getByText("Add Overlay Data"));

  expect(screen.getByText(ITS_OPEN_TEXT)).toBeInTheDocument();

  await userEvent.click(screen.getByText("Close Overlay Data"));

  expect(screen.getByText(ITS_CLOSE_TEXT)).toBeInTheDocument();
});
