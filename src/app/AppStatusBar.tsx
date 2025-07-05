import { useAtomValue } from "jotai";

import styles from "./AppStatusBar.module.css";
import PulseLoader from "@/components/PulseLoader";
import { StatusBar, StatusBarItem } from "@/components/StatusBar";

import CheckIcon from "@/assets/icons/CheckIcon.svg?react";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";
import ErrorIcon from "@/assets/icons/ErrorIcon.svg?react";
import WarningIcon from "@/assets/icons/WarningIcon.svg?react";

import { modelStatusAtom } from "@/stores/workspace";
import { simulationResultAtom, variablesAtom } from "@/stores/workspace";

const ModelStatusItem = () => {
  const status = useAtomValue(modelStatusAtom);

  switch (status.type) {
    case "loading":
      return (
        <StatusBarItem className={styles.itemLoading}>
          <PulseLoader size="4px" spacing="2px" />
          Model Loading
        </StatusBarItem>
      );

    case "success":
      return (
        <StatusBarItem className={styles.itemSuccess}>
          <CheckIcon />
          Model Loaded
        </StatusBarItem>
      );

    case "error":
      return (
        <>
          <StatusBarItem className={styles.itemFail}>
            <CrossIcon width="1em" height="1em" />
            Model Error
          </StatusBarItem>
          <StatusBarItem>
            <ErrorIcon className={styles.errorIcon} width="1em" height="1em" />
            {status.message}
          </StatusBarItem>
        </>
      );
  }
};

// TODO: add unit tests for this
const MissingDataStatusItem = () => {
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
  } else if (
    simulatorResult?.type === "parameterScan" &&
    simulatorResult.mode === "steadyState"
  ) {
    haveSet.add(simulatorResult.parameter);
    for (const scan of simulatorResult.scans[0].concentrations) {
      haveSet.add(scan.name);
    }
  }

  const missing = variables
    .filter((v) => v.visible)
    .filter((v) => !haveSet.has(v.name));
  if (missing.length > 0) {
    return (
      <StatusBarItem>
        <WarningIcon className={styles.warningIcon} width="1em" height="1em" />
        Missing data for variables configured to display. Please resimulate.
      </StatusBarItem>
    );
  } else {
    return null;
  }
};

const AppStatusBar = () => {
  return (
    <StatusBar>
      <ModelStatusItem />
      <MissingDataStatusItem />
    </StatusBar>
  );
};

export default AppStatusBar;
