import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { renderWithinWorkspace } from "@/testing-utils/render";
import PlotSettingsPanel from "../PlotSettingsPanel";

// TODO: add more tests

it("should run close on click", async () => {
  const onClose = vi.fn();

  renderWithinWorkspace(<PlotSettingsPanel onClose={onClose} />);

  await userEvent.click(screen.getByLabelText("Close"));

  expect(onClose).toHaveBeenCalledOnce();
});
