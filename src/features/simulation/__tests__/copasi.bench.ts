import { bench, vi } from "vitest";
vi.unmock("@/features/workers");
import { CopasiSimulator } from "../CopasiSimulator";

import defaultModel from "@/assets/default.ant?raw";
import kholodenkoMedium from "./kholodenko_medium.ant?raw";
import firczukLarge from "./firczuk_large.ant?raw";
import smallboneXlarge from "./smallbone_xlarge.ant?raw";

{
  const simulator = new CopasiSimulator();
  const variables = await simulator.loadModel(defaultModel);
  const includedVariables = variables.filter(
    (v) => v.category === "Floating Species",
  );

  bench(
    "default ant",
    async () => {
      await simulator.simulateTimeCourse(defaultModel, {
        parameters: {
          startTime: 0,
          endTime: 20,
          includedVariables: includedVariables,
          numberOfPoints: 200,
          resetInitialConditions: false,
        },
        variableValues: {},
      });
    },
    { warmupIterations: 5, iterations: 100 },
  );
}

{
  const simulator = new CopasiSimulator();
  const variables = await simulator.loadModel(kholodenkoMedium);
  const includedVariables = variables.filter(
    (v) => v.category === "Floating Species",
  );

  bench(
    "kholodenko medium",
    async () => {
      await simulator.simulateTimeCourse(kholodenkoMedium, {
        parameters: {
          startTime: 0,
          endTime: 30,
          includedVariables: includedVariables,
          numberOfPoints: 400,
          resetInitialConditions: false,
        },
        variableValues: {},
      });
    },
    { warmupIterations: 5, iterations: 250 },
  );
}

{
  const simulator = new CopasiSimulator();
  const variables = await simulator.loadModel(firczukLarge);
  const includedVariables = variables.filter(
    (v) => v.category === "Floating Species",
  );

  bench(
    "firczuk large",
    async () => {
      await simulator.simulateTimeCourse(firczukLarge, {
        parameters: {
          startTime: 0,
          endTime: 30,
          includedVariables: includedVariables,
          numberOfPoints: 300,
          resetInitialConditions: false,
        },
        variableValues: {},
      });
    },
    { warmupIterations: 3, iterations: 50 },
  );
}

{
  const simulator = new CopasiSimulator();
  const variables = await simulator.loadModel(smallboneXlarge);
  const includedVariables = variables.filter(
    (v) => v.category === "Floating Species",
  );

  bench(
    "smallbone xlarge",
    async () => {
      await simulator.simulateTimeCourse(smallboneXlarge, {
        parameters: {
          startTime: 0,
          endTime: 30,
          includedVariables: includedVariables,
          numberOfPoints: 300,
          resetInitialConditions: false,
        },
        variableValues: {},
      });
    },
    { warmupIterations: 3, iterations: 25 },
  );
}
