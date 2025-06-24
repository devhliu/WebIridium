import DataTable from "@/components/DataTable";
import type { SimulationResult } from "@/stores/workspace";
import { getParameterScanTitle } from "./shared";
import { memo } from "react";

export interface ResultsTableProps {
  result: SimulationResult;
}

const ResultsTable = memo(({ result }: ResultsTableProps) => {
  const columns = [];
  switch (result.type) {
    case "timeCourse":
      for (let i = 0; i < result.columns.length; i++) {
        columns.push({
          title: result.titles[i],
          rows: result.columns[i],
        });
      }
      break;

    case "parameterScan":
      // only need one time column
      columns.push({
        title: result.scans[0].titles[0],
        rows: result.scans[0].columns[0],
      });

      for (let i = 1; i < result.scans[0].columns.length; i++) {
        for (const scan of result.scans) {
          const title = getParameterScanTitle(
            scan.titles[i],
            result.parameter,
            scan.value,
          );
          columns.push({
            title,
            rows: scan.columns[i],
          });
        }
      }
      break;

    default:
      break;
  }

  return <DataTable columns={columns} decimalPlaces={2} />;
});

ResultsTable.displayName = "ResultsTable";

export default ResultsTable;
