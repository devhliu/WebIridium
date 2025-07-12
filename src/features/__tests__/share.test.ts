import { describe, it, expect } from "vitest";
import {
  getShareUrlFragment,
  parseShareData,
  readShareUrlFragment,
  type ReadShareUrlFragmentResult,
  type ShareWorkspaceData,
} from "../share";

const isFailResult = (result: ReadShareUrlFragmentResult): boolean => {
  return result.type === "error";
};

const isSuccessResult = (result: ReadShareUrlFragmentResult): boolean => {
  return result.type === "success";
};

const goodShareWorkspaceData = {
  version: 0,
  name: "good",
  code: "model",
  simulation: {
    type: "timeCourse",
    parameters: {
      startTime: 5,
      endTime: 10,
      numberOfPoints: 100,
    },
  },
} satisfies ShareWorkspaceData;

describe("url fragment", () => {
  it("should not read if prefix does not match", async () => {
    expect((await readShareUrlFragment("fake")).type).toBe("notShare");
  });

  // DOES NOT WORK (apis not available in test environment)
  it.skip("should be reversible", async () => {
    const getResult = await getShareUrlFragment(goodShareWorkspaceData);
    if (getResult.type !== "success") throw new Error(getResult.message);

    const readResult = await readShareUrlFragment(getResult.fragment);
    if (readResult.type !== "success")
      throw new Error(
        ("message" in readResult && readResult.message) || "not share",
      );

    expect(
      JSON.stringify(readResult) === JSON.stringify(goodShareWorkspaceData),
    );
  });
});

describe("parsing", () => {
  it("should fail on non-object", () => {
    expect(parseShareData(null)).toSatisfy(isFailResult);
    expect(parseShareData(123)).toSatisfy(isFailResult);
    expect(parseShareData("{}")).toSatisfy(isFailResult);
  });

  it("should fail on bad version", () => {
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        version: 100121014,
      }),
    ).toSatisfy(isFailResult);
  });

  it("should fail on bad name", () => {
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        name: 123,
      }),
    ).toSatisfy(isFailResult);
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        name: {},
      }),
    ).toSatisfy(isFailResult);
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        name: true,
      }),
    ).toSatisfy(isFailResult);
  });

  it("should fail on bad code", () => {
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        code: 123,
      }),
    ).toSatisfy(isFailResult);
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        code: {},
      }),
    ).toSatisfy(isFailResult);
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        code: true,
      }),
    ).toSatisfy(isFailResult);
  });

  it("should fail on bad time course", () => {
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          ...goodShareWorkspaceData.simulation,
          type: "timecourse",
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          type: "timeCourse",
          parameterz: goodShareWorkspaceData.simulation.parameters,
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          ...goodShareWorkspaceData.simulation,
          parameters: {
            ...goodShareWorkspaceData.simulation.parameters,
            startTime: -1,
          },
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          ...goodShareWorkspaceData.simulation,
          parameters: {
            ...goodShareWorkspaceData.simulation.parameters,
            endTime: 1,
          },
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          ...goodShareWorkspaceData.simulation,
          parameters: {
            ...goodShareWorkspaceData.simulation.parameters,
            numberOfPoints: 124.5,
          },
        },
      }),
    ).toSatisfy(isFailResult);
  });

  it("should fail on bad steady state", () => {
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          type: "steadystate",
          parameters: null,
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          type: "steadyState",
          parameterz: null,
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          type: "steadyState",
          parameters: {},
        },
      }),
    ).toSatisfy(isFailResult);

    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          type: "steadyState",
          parameters: true,
        },
      }),
    ).toSatisfy(isFailResult);
  });

  it("should succeed on good data", () => {
    expect(parseShareData(goodShareWorkspaceData)).toSatisfy(isSuccessResult);
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        simulation: {
          type: "steadyState",
          parameters: null,
        },
      }),
    ).toSatisfy(isSuccessResult);
  });

  it("should not retain extra fields", () => {
    expect(
      parseShareData({
        ...goodShareWorkspaceData,
        EXTRA_FIELD: 123,
        simulation: {
          type: "timeCourse",
          parameters: {
            ...goodShareWorkspaceData.simulation.parameters,
            EXTRA_FIELD: 123,
          },
        },
      }),
    ).toEqual({ type: "success", data: goodShareWorkspaceData });
  });
});
