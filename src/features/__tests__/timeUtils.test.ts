import { describe, it, expect } from "vitest";

import { timeToAgoText } from "../timeUtils";

describe("timeToAgoText", () => {
  it("should say just now when <0", () => {
    expect(timeToAgoText(1)).toBe("Just now");
    expect(timeToAgoText(-1)).toBe("Just now");
    expect(timeToAgoText(-100000)).toBe("Just now");
  });

  it("should say the right amount of time", () => {
    expect(timeToAgoText(1_500)).toBe("Just now");
    expect(timeToAgoText(50_000)).toBe("Just now");
    expect(timeToAgoText(60_000)).toBe("1 minute ago");
    expect(timeToAgoText(61_000)).toBe("1 minute ago");
    expect(timeToAgoText(65_000)).toBe("1 minute ago");
    expect(timeToAgoText(120_000)).toBe("2 minutes ago");
    expect(timeToAgoText(150_000)).toBe("2 minutes ago");
    expect(timeToAgoText(3053_000)).toBe("50 minutes ago");
    expect(timeToAgoText(3600_000)).toBe("1 hour ago");
    expect(timeToAgoText(3653_000)).toBe("1 hour ago");
    expect(timeToAgoText(3713_000)).toBe("1 hour 1 minute ago");
    expect(timeToAgoText(3773_000)).toBe("1 hour 2 minutes ago");
    expect(timeToAgoText(7373_000)).toBe("2 hours 2 minutes ago");
    expect(timeToAgoText(86400_000)).toBe("1 day ago");
    expect(timeToAgoText(86460_000)).toBe("1 day 1 minute ago");
  });
});
