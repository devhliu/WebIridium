import { memo } from "react";
import { useAtomValue } from "jotai";
import DataTable from "@/components/DataTable";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import type { SimulationResult } from "@/features/simulation/Simulator";
import {
  independentVariableAtom,
  variableSettingssAtom,
} from "@/globals/workspace/settings";
import { generateTableParameters } from "./generateTableParameters";

export interface ResultsTableProps {
  result: SimulationResult;
}

const ResultsTable = memo(({ result }: ResultsTableProps) => {
  const timeCourseIndependentVariable = useAtomValue(independentVariableAtom);
  const scanIndepedentVariable = useScanIndependentVariable();
  const variableSettingss = useAtomValue(variableSettingssAtom);

  const { columns } = generateTableParameters(
    result,
    variableSettingss,
    timeCourseIndependentVariable,
    scanIndepedentVariable,
  );

  return <DataTable columns={columns} decimalPlaces={2} />;
});

ResultsTable.displayName = "ResultsTable";

export default ResultsTable;
