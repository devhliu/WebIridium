// stuff for your datasets

import { getDefaultColorForIndex } from "@/features/colors";
import { atom } from "jotai";

export interface Dataset {
  name: string;
  enabled: boolean;
  independentVariableName: string;
  variables: Record<string, DatasetVariable>;
  columns: {
    title: string;
    values: number[];
  }[];
}

export interface DatasetVariable {
  name: string;
  displayName: string;
  visible: boolean;
  color: string;
  size: number;
}

export const datasetsAtom = atom<Dataset[]>([]);

/**
 * Returns a version of `name` that is not taken.
 *
 * THIS IS ONLY EXPORTED FOR TESTING!
 */
export const getAvailableName = (datasets: Dataset[], name: string): string => {
  let candidate = name;
  let n = 0;
  while (datasets.some((d) => d.name === candidate)) {
    candidate = `${name}_${++n}`;
  }
  return candidate;
};

// TODO: add support for CSV escapes
/** THIS IS ONLY EXPORTED FOR TESTING! */
export const getColumnsFromCsv = (csv: string): Dataset["columns"] => {
  const rows = csv
    .trim()
    .split("\n")
    .map((r) => r.split(","));
  const totalRows = rows.length;
  if (totalRows < 2)
    throw new Error("Need at least one row for titles and one for values.");

  const totalColumns = rows[0].length;
  if (totalColumns < 2)
    throw new Error("Data must contain at least two columns.");
  if (rows[0].length !== new Set(rows[0]).size)
    throw new Error("Duplicate column titles.");
  if (rows.some((r) => r.length !== totalColumns))
    throw new Error("Rows contain differing number of columns.");

  const columns = [];
  for (let x = 0; x < totalColumns; x++) {
    const values = [];
    for (let y = 1; y < totalRows; y++) {
      const value = +rows[y][x];
      if (isNaN(value)) {
        throw new Error("Got non-numeric value, data must be numeric.");
      }
      values.push(value);
    }

    columns.push({
      title: rows[0][x],
      values: values,
    });
  }

  return columns;
};

export type ImportResult =
  | { type: "success"; dataset: Dataset }
  | { type: "error"; message: string };

export const importCsvDatasetAtom = atom(
  null,
  (get, set, { name, csv }: { name: string; csv: string }): ImportResult => {
    try {
      const datasets = get(datasetsAtom);
      const chosenName = getAvailableName(datasets, name);
      const columns = getColumnsFromCsv(csv);
      const variables: Record<string, DatasetVariable> = {};

      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        variables[column.title] = {
          name: column.title,
          displayName: column.title,
          visible: true,
          color: getDefaultColorForIndex(i),
          size: 5,
        };
      }

      const dataset = {
        name: chosenName,
        enabled: true,
        independentVariableName: columns[0].title,
        columns: columns,
        variables: variables,
      };

      set(datasetsAtom, [...datasets, dataset]);

      return { type: "success", dataset };
    } catch (err) {
      if (err instanceof Error) {
        return {
          type: "error",
          message: err.message,
        };
      } else {
        throw err;
      }
    }
  },
);
