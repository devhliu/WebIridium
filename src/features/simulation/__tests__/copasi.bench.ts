import { describe, bench, vi } from "vitest";
vi.unmock("@/features/workers");
import { CopasiSimulator } from "../CopasiSimulator";

import defaultModel from "@/assets/default.ant?raw";
import kholodenkoMedium from "./kholodenko_medium.ant?raw";
import firczukLarge from "./firczuk_large.ant?raw";
import smallboneXlarge from "./smallbone_xlarge.ant?raw";

const models = {
  "default model": defaultModel,
  "kholodenko medium": kholodenkoMedium,
  "firczuk large": firczukLarge,
  "smallbone xlarge": smallboneXlarge,
};

describe("simple time course", async () => {
  for (const [name, code] of Object.entries(models)) {
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
