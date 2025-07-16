import { describe, it, expect } from "vitest";
import { searchBiomodels } from "../biomodels";

describe("searchModels", () => {
  it("should return 0 results when 0 are requested", async () => {
    const result = await searchBiomodels("", 0);
    expect(result).toHaveLength(0);
  });

  it("should return 1 result when 1 is requested", async () => {
    const result = await searchBiomodels("egg", 1);
    expect(result).toHaveLength(1);
  });

  it("should return 5 result when 5 is requested", async () => {
    const result = await searchBiomodels("a", 5);
    expect(result).toHaveLength(5);
  });

  it("should search id when it looks like an id", async () => {
    const result = await searchBiomodels("1004", 100);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "BIOMD0000001004",
    });
  });

  it("should abort with an exception", async () => {
    const abortController = new AbortController();
    abortController.abort();
    await expect(
      searchBiomodels("a", 100, abortController.signal),
    ).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
