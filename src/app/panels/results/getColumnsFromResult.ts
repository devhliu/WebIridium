import type { SimulationResult } from "@/features/simulation/Simulator";

export interface ResultColumn {
  variableName: string;
  values: number[];

  // only used in parameter scan results
  scanPercent?: number;
  parameterValue?: number;
}

export const getColumnsFromResult = (
  result: SimulationResult,
  timeCourseIndependentVariable: string | null,
  scanIndependentVariable: string,
): [ResultColumn[], independentVariableName: string] => {
  const columns: ResultColumn[] = [];
  let independentVariableName: string = "";
  // Collect columns
  if (result.type === "timeCourse") {
    independentVariableName = timeCourseIndependentVariable ?? "";

    for (const { title, values } of result.columns) {
      columns.push({ variableName: title, values });
    }
  } else if (result.type === "parameterScan" && result.mode === "timeCourse") {
    independentVariableName = scanIndependentVariable;

    for (const scan of result.scans) {
      for (const { title, values } of scan.columns) {
        columns.push({
          variableName: title,
          parameterValue: scan.parameterValue,
          scanPercent: scan.scanPercent,
          values,
        });
      }
    }
  } else if (result.type === "parameterScan" && result.mode === "steadyState") {
    independentVariableName = result.parameter;
    columns.push({
      variableName: result.parameter,
      values: result.scans.map((s) => s.parameterValue),
    });

    const concentrationsMap = new Map<string, number[]>();

    // transpose
    for (const scan of result.scans) {
      for (const { name, value } of scan.concentrations) {
        if (!concentrationsMap.has(name)) {
          concentrationsMap.set(name, [value]);
        } else {
          concentrationsMap.get(name)!.push(value);
        }
      }
    }

    for (const [variableName, concentrations] of concentrationsMap.entries()) {
      columns.push({ variableName, values: concentrations });
    }
  } else {
    return [[], ""];
  }

  return [columns, independentVariableName];
};
