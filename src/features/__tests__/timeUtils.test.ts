import { describe, it, expect } from "vitest";

import { millisecondsToText } from "../timeUtils";

describe("millisecondsToText", () => {
  it("should say just now on <0 input", () => {
    expect(millisecondsToText(1)).toBe("just now");
    expect(millisecondsToText(-1)).toBe("just now");
    expect(millisecondsToText(-100000)).toBe("just now");
  });

  it("should say the right amount of time", () => {
    expect(millisecondsToText(1_500)).toBe("1 second");
    expect(millisecondsToText(50_000)).toBe("50 seconds");
    expect(millisecondsToText(60_000)).toBe("1 minute");
    expect(millisecondsToText(61_000)).toBe("1 minute 1 second");
    expect(millisecondsToText(65_000)).toBe("1 minute 5 seconds");
    expect(millisecondsToText(120_000)).toBe("2 minutes");
    expect(millisecondsToText(150_000)).toBe("2 minutes 30 seconds");
    expect(millisecondsToText(3053_000)).toBe("50 minutes 53 seconds");
    expect(millisecondsToText(3600_000)).toBe("1 hour");
    expect(millisecondsToText(3653_000)).toBe("1 hour 53 seconds");
    expect(millisecondsToText(3713_000)).toBe("1 hour 1 minute 53 seconds");
    expect(millisecondsToText(3773_000)).toBe("1 hour 2 minutes 53 seconds");
    expect(millisecondsToText(7373_000)).toBe("2 hours 2 minutes 53 seconds");
    expect(millisecondsToText(86400_000)).toBe("1 day");
    expect(millisecondsToText(86460_000)).toBe("1 day 1 minute");
  });

  it("should ignore seconds if told to", () => {
    expect(millisecondsToText(1_500, { ignoreSeconds: true })).toBe("just now");
    expect(millisecondsToText(50_000, { ignoreSeconds: true })).toBe(
      "just now",
    );
    expect(millisecondsToText(60_000, { ignoreSeconds: true })).toBe(
      "1 minute",
    );
    expect(millisecondsToText(61_000, { ignoreSeconds: true })).toBe(
      "1 minute",
    );
    expect(millisecondsToText(65_000, { ignoreSeconds: true })).toBe(
      "1 minute",
    );
    expect(millisecondsToText(120_000, { ignoreSeconds: true })).toBe(
      "2 minutes",
    );
    expect(millisecondsToText(150_000, { ignoreSeconds: true })).toBe(
      "2 minutes",
    );
    expect(millisecondsToText(3053_000, { ignoreSeconds: true })).toBe(
      "50 minutes",
    );
    expect(millisecondsToText(3653_000, { ignoreSeconds: true })).toBe(
      "1 hour",
    );
    expect(millisecondsToText(3713_000, { ignoreSeconds: true })).toBe(
      "1 hour 1 minute",
    );
    expect(millisecondsToText(3773_000, { ignoreSeconds: true })).toBe(
      "1 hour 2 minutes",
    );
    expect(millisecondsToText(7373_000, { ignoreSeconds: true })).toBe(
      "2 hours 2 minutes",
    );
  });

  it("should add ago when specified", () => {
    expect(millisecondsToText(0, { ago: true })).toBe("just now");
    expect(millisecondsToText(30_000, { ago: true })).toBe("30 seconds ago");
  });
});
