import { describe, it, expect, afterEach } from "vitest";
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";
import { TaskTermination } from "../taskPool";
import {
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
} from "@/testing-utils/mockWorker";
import type { Variable } from "../simulation/Simulator";

const makeGenericVariable = (name: string): Variable => {
  return {
    type: "normal",
    defaultDisplayName: name,
    name: name,
    category: "Test",
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
        resetInitialConditions: true,
        includedVariables: [
          makeGenericVariable("A"),
          makeGenericVariable("B"),
          makeGenericVariable("C"),
        ],
      },
      variableValues: {},
    },
    abortSignal,
  );
};

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
    ).rejects.toThrowError(new TaskTermination());
    abortController.abort();
    await expectPromise;
  });
});
