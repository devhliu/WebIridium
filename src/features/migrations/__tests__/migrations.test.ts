import {
  migrateIridiumData,
  migrateMetadata,
  migrateResultsData,
  type IridiumData,
  type Metadata,
  type ResultsData,
  type UnknownIridiumData,
  type UnknownMetadata,
  type UnknownResultsData,
} from "@/features/projectData";
import { defaultGraphSettings } from "@/features/graphPresets";
import {
  defaultParameterScanOptions,
  defaultTimeCourseParameters,
} from "@/globals/settings";
import { describe, it, expect } from "vitest";

describe("iridium data", () => {
  const olderVersions: UnknownIridiumData[] = [
    {
      versionTag: 1,
      graphSettings: defaultGraphSettings,
      variableSettings: {},
    },
    {
      versionTag: 2,
      graphSettings: defaultGraphSettings,
      variableSettings: {},
      timeCourseParameters: defaultTimeCourseParameters,
      parameterScanOptions: defaultParameterScanOptions,
    },
  ];

  const finalVersion: IridiumData = {
    versionTag: 3,
    currentGraphPreset: "Custom",
    graphSettings: defaultGraphSettings,
    variableSettings: {},
    timeCourseParameters: defaultTimeCourseParameters,
    parameterScanOptions: defaultParameterScanOptions,
  };

  it("should migrate gracefully", () => {
    for (const data of olderVersions) {
      expect(migrateIridiumData(data)).toEqual(finalVersion);
    }
  });
});

describe("metadata", () => {
  const olderVersions: UnknownMetadata[] = [
    {
      versionTag: 1,
      name: "test",
      created: 0,
      updated: 0,
      icon: {
        color: "blue",
      },
    },
  ];

  const finalVersion: Metadata = {
    versionTag: 1,
    name: "test",
    created: 0,
    updated: 0,
    icon: {
      color: "blue",
    },
  };

  it("should migrate gracefully", () => {
    for (const data of olderVersions) {
      expect(migrateMetadata(data)).toEqual(finalVersion);
    }
  });
});

describe("results data", () => {
  const olderVersions: UnknownResultsData[] = [];

  const finalVersion: ResultsData = {
    versionTag: 1,
    records: [
      {
        modelName: "test",
        code: "",
        unixTimestampMs: 0,
        simulationResult: {
          type: "timeCourse",
          columns: [
            {
              title: "A",
              values: [0, 1, 2],
            },
            {
              title: "B",
              values: [0, 1, 2],
            },
          ],
        },
      },
      {
        modelName: "test",
        code: "",
        unixTimestampMs: 0,
        simulationResult: {
          type: "steadyState",
          value: 1,
          concentrations: [
            { name: "A", value: 2 },
            { name: "B", value: 2 },
          ],
          eigenValues: [
            [0, 1],
            [2, 3],
          ],
          jacobian: {
            columns: ["A", "B"],
            rows: ["A", "B"],
            values: [
              [0, 1],
              [2, 3],
            ],
          },
          concentrationControl: {
            columns: ["A", "B"],
            rows: ["A", "B"],
            values: [
              [0, 1],
              [2, 3],
            ],
          },
          fluxControl: {
            columns: ["A", "B"],
            rows: ["A", "B"],
            values: [
              [0, 1],
              [2, 3],
            ],
          },
          elasticities: {
            columns: ["A", "B"],
            rows: ["A", "B"],
            values: [
              [0, 1],
              [2, 3],
            ],
          },
        },
      },
      {
        modelName: "test",
        code: "test",
        unixTimestampMs: 0,
        simulationResult: {
          type: "parameterScan",
          mode: "timeCourse",
          parameter: "C",
          scans: [
            {
              type: "timeCourse",
              parameterValue: 0,
              scanPercent: 0,
              columns: [
                {
                  title: "A",
                  values: [0, 1, 2],
                },
                {
                  title: "B",
                  values: [0, 1, 2],
                },
              ],
            },
            {
              type: "timeCourse",
              parameterValue: 1,
              scanPercent: 0.5,
              columns: [
                {
                  title: "A",
                  values: [0, 1, 2],
                },
                {
                  title: "B",
                  values: [0, 1, 2],
                },
              ],
            },
            {
              type: "timeCourse",
              parameterValue: 2,
              scanPercent: 1,
              columns: [
                {
                  title: "A",
                  values: [0, 1, 2],
                },
                {
                  title: "B",
                  values: [0, 1, 2],
                },
              ],
            },
          ],
        },
      },
      {
        modelName: "stub",
        code: "test",
        unixTimestampMs: 0,
        simulationResult: {
          type: "parameterScan",
          mode: "steadyState",
          parameter: "C",
          scans: [
            {
              parameterValue: 0,
              scanPercent: 0,
              concentrations: [
                {
                  name: "A",
                  value: 4,
                },
                {
                  name: "B",
                  value: 4,
                },
              ],
            },
            {
              parameterValue: 0.5,
              scanPercent: 0.5,
              concentrations: [
                {
                  name: "A",
                  value: 4,
                },
                {
                  name: "B",
                  value: 4,
                },
              ],
            },
            {
              parameterValue: 1,
              scanPercent: 1,
              concentrations: [
                {
                  name: "A",
                  value: 4,
                },
                {
                  name: "B",
                  value: 4,
                },
              ],
            },
          ],
        },
      },
    ],
  };

  it("should migrate gracefully", () => {
    for (const data of olderVersions) {
      expect(migrateResultsData(data)).toEqual(finalVersion);
    }
  });
});
