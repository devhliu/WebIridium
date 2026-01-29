import { describe, bench, vi } from "vitest";
vi.unmock("@/features/workers");
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";

import { testModels } from "./testModels.ts";

describe("simple time course", async () => {
  for (const [name, code] of Object.entries(testModels)) {
    const simulator = new CopasiSimulator();
    const variables = await simulator.loadModel(code);
    const includedVariables = variables.filter(
      (v) => v.category === "Floating Species",
    );

    bench(
      name,
      async () => {
        await simulator.simulateTimeCourse(code, {
          parameters: {
            startTime: 0,
            endTime: 30,
            includedVariables: includedVariables,
            numberOfPoints: 300,
            resetInitialConditions: true,
          },
          variableValues: {},
        });
      },
      { warmupIterations: 5 },
    );
  }
});

describe("load model", () => {
  for (const [name, code] of Object.entries(testModels)) {
    bench(name, async () => {
      const simulator = new CopasiSimulator();
      await simulator.loadModel(code);
    });
  }
});
