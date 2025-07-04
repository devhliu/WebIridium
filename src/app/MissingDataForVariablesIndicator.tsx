import { useAtomValue } from "jotai";
import { simulationResultAtom, variablesAtom } from "@/stores/workspace";

export const MissingDataForVariablesIndicator = () => {
  const simulatorResult = useAtomValue(simulationResultAtom);
  const variables = useAtomValue(variablesAtom);

  if (!simulatorResult) {
    return null;
  }

  const haveSet = new Set();
  if (simulatorResult?.type === "timeCourse") {
    for (const column of simulatorResult.columns) {
      haveSet.add(column.title);
    }
  } else if (
    simulatorResult?.type === "parameterScan" &&
    simulatorResult.mode === "timeCourse"
  ) {
    for (const scan of simulatorResult.scans) {
      for (const column of scan.columns) {
        haveSet.add(column.title);
      }
    }
  }

  const missing = variables
    .filter((v) => v.visible)
    .filter((v) => !haveSet.has(v.name));
  if (missing.length > 0) {
    return (
      <p style={{ color: "var(--color-primary-foreground)" }}>
        missing some data. please resimulate
      </p>
    );
  } else {
    return null;
  }
};
