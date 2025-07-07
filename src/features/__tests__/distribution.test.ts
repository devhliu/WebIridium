import { describe, it, expect } from "vitest";
import {
  getLinearDistribution,
  getLogarithmicDistribution,
} from "@/features/distribution";

describe("parameter scan distributions", () => {
  it("should have working linear distribution", () => {
    expect(getLinearDistribution(0, 100, 5)).toEqual([0, 25, 50, 75, 100]);
  });

  it("should have working logarithmic distribution", () => {
    expect(getLogarithmicDistribution(1, 10000, 5)).toEqual([
      1, 10, 100, 1000, 10000,
    ]);
  });
});
