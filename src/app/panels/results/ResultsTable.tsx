import { memo } from "react";
import { useAtomValue } from "jotai";
import DataTable, { type DataTableProps } from "@/components/DataTable";
import { getParameterScanTitle } from "./shared";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import type { SimulationResult } from "@/features/simulation/Simulator";
import { independentVariableAtom } from "@/stores/workspace";

export interface ResultsTableProps {
  result: SimulationResult;
}

const ResultsTable = memo(({ result }: ResultsTableProps) => {
  const independentVariable = useAtomValue(independentVariableAtom);
  const scanIndepedentVariable = useScanIndependentVariable();

  let columns: DataTableProps["columns"] = [];
  if (result.type === "timeCourse") {
    // move independent column to the start
    columns = [...result.columns];
    const independentColumnIndex = columns.findIndex(
      (col) => col.title === independentVariable,
    );

    const [independentColumn] = columns.splice(independentColumnIndex, 1);
    columns.unshift(independentColumn);
  } else if (
    result.type === "parameterScan" &&
    result.method === "timeCourse"
  ) {
    // only need one column for the independent variable
    // TODO: handle the column is not there?
    columns.push(
      result.scans[0].columns.find((c) => c.title === scanIndepedentVariable)!,
    );

    for (let i = 1; i < result.scans[0].columns.length; i++) {
      for (const scan of result.scans) {
        if (scan.columns[i].title === scanIndepedentVariable) continue;

        const title = getParameterScanTitle(
          scan.columns[i].title,
          result.parameter,
          scan.parameterValue,
        );
        columns.push({
          title,
          values: scan.columns[i].values,
        });
      }
    }
  }

  return <DataTable columns={columns} decimalPlaces={2} />;
});

ResultsTable.displayName = "ResultsTable";

export default ResultsTable;
