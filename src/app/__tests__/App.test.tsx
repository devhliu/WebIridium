import { test, expect, afterEach, describe, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderFlush } from "@/testing-utils/render";
import userEvent from "@testing-library/user-event";

import App from "@/app/App";

const RESULTS_PANEL_TEST_ID = "results-panel";

test("results panel should only be visible after simulating", async () => {
  await renderFlush(<App />);

  expect(screen.queryByTestId(RESULTS_PANEL_TEST_ID)).not.toBeInTheDocument();

  const simulateButton = screen.getByText("Simulate");
  await userEvent.click(simulateButton);

  expect(screen.getByTestId(RESULTS_PANEL_TEST_ID)).toBeInTheDocument();
});

const SAMPLE_SHARE_FRAGMENT =
  "#s%3DNZHLTsMwEEV%2F5cobpCo0aRGbVkVqKxZIvCRYZuMmE2oSeyp7DFSo%2F44mLSuP7z0zmsev%2BaKYHAezqAoTrCezMG9io1DEE7c0mMI03Kpclnhk28LCq4EuskfrUl9AjgeCC%2F9WUYeyBEccXNODA4E7yJ5AP9YfBjpTaawwourdn70ETyHXYdSfWWiBsoRLyIlaCMOF1jVWCBYNe09BLjBNP6YarnF9h80S%2FWyyrsNGf9sl%2BvlkU4d%2BhhWq6c2tCmM4V2SFaomtPpq%2Bwqy61HzocOR8FQmBBSlHwvfeivbRcoHPnGTkmkEn1TGS83nQ9nZZhIOSKg%2FUSR1MYS7%2BuPJfo4szCyPO05ZzTGQKc7DRehKKSYmkx3h3epiqMBTaczzXc2W%2Fo%2FjSvbILklSrTqfTHw%3D%3D";

const UNREASONABLE_SAMPLE_SHARE_FRAGMENT =
  "#s%3DNZHLTsMwEEV%2F5cobpCo0aRGbVkVqKxZIvCRYZuMmE2oSeyp7DFSo%2F44mLSuP7z0zmsev%2BaKYHAezqAoTrCezMG9io1DEE7c0mMI03Kpclnhk28LCq4EuskfrUl9AjgeCC%2F9WUYeyBEccXNODA4E7yJ5AP9YfBjpTaawwourdn70ETyHXYdSfWWiBsoRLyIlaCMOF1jVWCBYNe09BLjBNP6YarnF9h80S%2FWyyrsNGf9sl%2BvlkU4d%2BhhWq6c2tCmM4V2SFaomtPpq%2Bwqy61HzocOR8FQmBBSlHwvfeivbRcoHPnGTkmkEn1TGS83nQ9nZZhIOSKg%2FUSR1MYS7%2BuPJfo4szCyPO05ZzTGQKc7DRehKKSYmkx3h3epiqMBTaczzXc2W%2Fo%2FjSvbILklSrqup0Ov0B";

describe("sharing", () => {
  afterEach(() => {
    location.hash = "";
  });

  it("should start a simulation when using a share link", async () => {
    location.hash = SAMPLE_SHARE_FRAGMENT;
    await renderFlush(<App />);

    await waitFor(() => {
      expect(screen.getByTestId(RESULTS_PANEL_TEST_ID)).toBeInTheDocument();
    });
  });

  it("should not start a simulation when using a share link with unreasonable parameters", async () => {
    location.hash = UNREASONABLE_SAMPLE_SHARE_FRAGMENT;
    await renderFlush(<App />);

    await expect(
      waitFor(
        () => {
          expect(screen.getByTestId(RESULTS_PANEL_TEST_ID)).toBeInTheDocument();
        },
        { timeout: 250 },
      ),
    ).rejects.toThrow();

    // should still set sim parameters
    expect(
      +screen.getByLabelText<HTMLInputElement>("Number of Points").value,
    ).toBeGreaterThan(5000);
  });

  it("should not start a simulation when not using a share link", async () => {
    await renderFlush(<App />);

    await expect(
      waitFor(
        () => {
          expect(screen.getByTestId(RESULTS_PANEL_TEST_ID)).toBeInTheDocument();
        },
        { timeout: 250 },
      ),
    ).rejects.toThrow();
  });
});
