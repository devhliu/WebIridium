import { describe, it, expect } from "vitest";
import { type Dataset, getAvailableName, getColumnsFromCsv } from "../datasets";

describe("getAvailableName", () => {
  it("should return available name", () => {
    expect(getAvailableName([], "test")).toEqual("test");

    expect(
      getAvailableName(
        [
          {
            name: "test",
          } as unknown as Dataset,
        ],
        "test",
      ),
    ).toEqual("test_1");

    expect(
      getAvailableName(
        [
          {
            name: "hey",
          } as unknown as Dataset,
        ],
        "test",
      ),
    ).toEqual("test");

    expect(
      getAvailableName(
        [
          {
            name: "test",
          } as unknown as Dataset,
        ],
        "test",
      ),
    ).toEqual("test_1");

    expect(
      getAvailableName(
        [
          {
            name: "test",
          } as unknown as Dataset,
          {
            name: "test_1",
          } as unknown as Dataset,
        ],
        "test",
      ),
    ).toEqual("test_2");
  });
});

describe("getColumnsFromCsv", () => {
  it("should return columns", () => {
    const result = getColumnsFromCsv(
      `Time,Concentration
      1,2
      3,4
      5,6`,
    );
    expect(result).toEqual([
      {
        title: "Time",
        values: [1, 3, 5],
      },
      {
        title: "Concentration",
        values: [2, 4, 6],
      },
    ]);
  });

  it("should error when the data is bad", () => {
    const badData = [
      "",
      "Time,Concentration",
      `Time,Time
       1,2
       3,4
       5,6`,
      `Time
       1,2
       3,4
       5,6`,
      `Time,Concentration
       1,2
       3
       5,6`,
      `Time,Concentration
       1,2
       3,bad
       5,6`,
    ];

    for (const data of badData) {
      expect(() => {
        getColumnsFromCsv(data);
      }).toThrowError();
    }
  });
});
