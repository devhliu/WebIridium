import { describe, it, expect } from "vitest";
import { searchModels } from "../biomodels";

describe("searchModels", () => {
  it("should return 0 results when 0 are requested", async () => {
    const result = await searchModels("", 0);
    expect(result).toHaveLength(0);
  });

  it("should return 1 result when 1 is requested", async () => {
    const result = await searchModels("egg", 1);
    expect(result).toHaveLength(1);
  });

  it("should return 5 result when 5 is requested", async () => {
    const result = await searchModels("a", 5);
    expect(result).toHaveLength(5);
  });

  it("should search id when it looks like an id", async () => {
    const result = await searchModels("1004", 100);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "BIOMD0000001004",
    });
  });

  it("should abort with no results", async () => {
    const abortController = new AbortController();
    abortController.abort();
    const result = await searchModels("a", 100, abortController.signal);
    expect(result).toHaveLength(0);
  });
});
