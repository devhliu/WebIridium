import type { EditableTimeCourseParameters } from "@/globals/workspace/settings";

export interface ExamplePreset {
  parameters: EditableTimeCourseParameters;
  independentVariable?: string;
}

const examplesRaw: Record<string, string> = import.meta.glob(
  "@/assets/examples/*",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

export const getNameFromPath = (path: string): string => {
  const fileNameWithExtension = path.split("/").slice(-1)[0];
  const fileName = fileNameWithExtension.split(".")[0];
  return fileName;
};

export const formatName = (name: string): string => {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\//g, " / ");
};

export const examples = Object.fromEntries(
  Object.entries(examplesRaw).map(([path, content]) => [
    getNameFromPath(path),
    content,
  ]),
);

export const exampleFormattedNames = Object.fromEntries(
  Object.entries(examples).map(([name, _]) => [name, formatName(name)]),
);

export const examplePresets: Record<string, ExamplePreset> = {
  "enzyme-catalyzed-three-step-pathway": {
    parameters: {
      startTime: 0,
      endTime: 20,
      numberOfPoints: 200,
    },
  },
  "example-large-model": {
    parameters: {
      startTime: 0,
      endTime: 20,
      numberOfPoints: 200,
    },
  },
  "feedback-oscillator-model": {
    parameters: {
      startTime: 0,
      endTime: 20,
      numberOfPoints: 200,
    },
  },
  "jana-wolf-glycolytic-model": {
    parameters: {
      startTime: 0,
      endTime: 5,
      numberOfPoints: 500,
    },
  },
  "lorenz-attractor": {
    parameters: {
      startTime: 0,
      endTime: 20,
      numberOfPoints: 2000,
    },
    independentVariable: "u",
  },
  "relaxation-oscillator:-from-heinrich-1997-review": {
    parameters: {
      startTime: 0,
      endTime: 10,
      numberOfPoints: 200,
    },
  },
  "simple-bistable-model": {
    parameters: {
      startTime: 0,
      endTime: 10,
      numberOfPoints: 200,
    },
  },
  "smallest-bistable-model:-thomas-wilhelm": {
    parameters: {
      startTime: 0,
      endTime: 15,
      numberOfPoints: 100,
    },
  },
  "smallest-hopf-model:-wilhelm-and-heinrich": {
    parameters: {
      startTime: 0,
      endTime: 50,
      numberOfPoints: 500,
    },
  },
  "tau-doyle-integral-controller": {
    parameters: {
      startTime: 0,
      endTime: 100,
      numberOfPoints: 500,
    },
  },
  "twenty-step-mass-action-pathway.txt": {
    parameters: {
      startTime: 0,
      endTime: 60,
      numberOfPoints: 200,
    },
  },
  "two-moiety-converved-cycle-model": {
    parameters: {
      startTime: 0,
      endTime: 7,
      numberOfPoints: 100,
    },
  },
};
