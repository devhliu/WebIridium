import DataTable, { type DataTableProps } from "@/components/DataTable";
import type { SimulationResult } from "@/features/simulation/Simulator";
import { getParameterScanTitle } from "./shared";
import { memo } from "react";

export interface ResultsTableProps {
  result: SimulationResult;
}

const ResultsTable = memo(({ result }: ResultsTableProps) => {
  let columns: DataTableProps["columns"] = [];
  if (result.type === "timeCourse") {
    columns = result.columns;
  } else if (
    result.type === "parameterScan" &&
    result.method === "timeCourse"
  ) {
    // only need one time column
    columns.push(result.scans[0].columns[0]);

    for (let i = 1; i < result.scans[0].columns.length; i++) {
      for (const scan of result.scans) {
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
