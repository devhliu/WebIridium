import clsx from "clsx";
import { useState } from "react";
import { useAtom } from "jotai";
import styles from "./WorkspaceBar.module.css";

import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

import { nameAtom } from "@/stores/workspace";

const isNameValid = (name: string): boolean => {
  return name.length > 0;
};

export const WorkspaceBar = () => {
  const [open, setOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useAtom(nameAtom);
  const [typing, setTyping] = useState("");

  const openInput = () => {
    setOpen(true);
    setTyping(workspaceName);
  };

  const cancelInput = () => {
    setOpen(false);
  };

  const closeInput = () => {
    if (isNameValid(typing)) {
      setOpen(false);
      setWorkspaceName(typing);
    } else {
      cancelInput()
    }
  };
  
  const handleInputBlur = () => {
    cancelInput();
  };

  const handleInputKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === "Enter") {
      closeInput();
    } else if (evt.key === "Escape") {
      cancelInput();
    }
  };

  if (!open) {
    return (
      <button className={styles.main} onClick={openInput}>
        <SearchIcon className={styles.searchIcon} />
        {workspaceName}
      </button>
    );
  } else {
    return (
      <div className={clsx(styles.main, styles.active)}>
        <SearchIcon className={styles.searchIcon} />
        <input id="workspaceBar" type="text" className={styles.input} autoFocus value={typing} onBlur={handleInputBlur} onKeyDown={handleInputKeyDown} onChange={(evt) => setTyping(evt.target.value)} />
      </div>
    );
  }
};

export default WorkspaceBar;
