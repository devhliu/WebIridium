import { describe, it, expect, afterEach, vi } from "vitest";
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";
import { WorkerTermination } from "../workerPool";
import {
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
} from "@/testing-utils/mockWorker";
import {
  getLinearDistribution,
  getLogarithmicDistribution,
} from "../simulation/useSimulate";
import type { Variable } from "../simulation/Simulator";

const makeGenericVariable = (name: string): Variable => {
  return {
    displayName: name,
    name: name,
    scanName: name,
    category: "Test",

    visible: false,
    color: "red",
    width: 2,
  };
};

const simulateTimeCourseGeneric = async (abortSignal?: AbortSignal) => {
  const simulationManager = new CopasiSimulator();
  return await simulationManager.simulateTimeCourse(
    "blah",
    {
      parameters: {
        startTime: 0,
        endTime: 10,
        numberOfPoints: 200,
        includeVariables: [
          makeGenericVariable("A"),
          makeGenericVariable("B"),
          makeGenericVariable("C"),
        ],
      },
    },
    abortSignal,
  );
};

vi.mock("@/features/workers");

afterEach(() => {
  resetWorkerResponseDelay();
});

describe("TimeCourse", () => {
  it("should run", async () => {
    await simulateTimeCourseGeneric();
  });

  it("should be abortable", async () => {
    setWorkerResponseDelay(1);
    const abortController = new AbortController();
    const expectPromise = expect(
      simulateTimeCourseGeneric(abortController.signal),
    ).rejects.toThrowError(new WorkerTermination());
    abortController.abort();
    await expectPromise;
  });
});

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
