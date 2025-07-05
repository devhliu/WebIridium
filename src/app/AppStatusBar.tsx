import { useAtomValue } from "jotai";

import PulseLoader from "@/components/PulseLoader";
import styles from "./AppStatusBar.module.css";

import CheckIcon from "@/assets/icons/CheckIcon.svg?react";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

import { StatusBar, StatusBarItem } from "@/components/StatusBar";
import { modelStatusAtom } from "@/stores/workspace";

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
          <StatusBarItem>{status.message}</StatusBarItem>
        </>
      );
  }
};

const AppStatusBar = () => {
  return (
    <StatusBar>
      <ModelStatusItem />
    </StatusBar>
  );
};

export default AppStatusBar;
