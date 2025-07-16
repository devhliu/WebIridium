import clsx from "clsx";
import { useState } from "react";
import { useAtom } from "jotai";
import styles from "./WorkspaceBar.module.css";

import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

import { nameAtom } from "@/globals/workspace/settings";
import Button from "@/components/Button";
import PulseLoader from "@/components/PulseLoader";

const AUTOCOMPLETE_POPUP_ID = "workspaceBarAutocomplete";

const isNameValid = (name: string): boolean => {
  return name.length > 0;
};

export const WorkspaceBar = () => {
  const [open, setOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useAtom(nameAtom);
  const [typing, setTyping] = useState("");

  const openInput = () => {
    setOpen(true);
    setTyping("");
  };

  const cancelInput = () => {
    setOpen(false);
  };

  const closeInput = () => {
    if (isNameValid(typing)) {
      setOpen(false);
      setWorkspaceName(typing);
    } else {
      cancelInput();
    }
  };

  const handleInputBlur = () => {
    cancelInput();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      closeInput();
    } else if (e.key === "Escape") {
      cancelInput();
    }
  };

  if (!open) {
    return (
      <button className={styles.main} onClick={openInput}>
        <SearchIcon className={styles.searchIcon} width="1em" height="1em" />
        {workspaceName}
      </button>
    );
  } else {
    return (
      <div className={clsx(styles.main, styles.active)}>
        <SearchIcon className={styles.searchIcon} />
        <input
          id="workspaceBar"
          type="search"
          className={styles.input}
          autoFocus
          value={typing}
          placeholder="Rename your model or search for one"

          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onChange={(e) => setTyping(e.target.value)}

          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={typing.length > 0 ? AUTOCOMPLETE_POPUP_ID : undefined}
          aria-haspopup="listbox"
        />

        {typing.length > 0 && <AutocompletePopup id={AUTOCOMPLETE_POPUP_ID} />}
      </div>
    );
  }
};

type AutocompleteItem =
  | { type: "simple"; value: string }
  | { type: "biomodel"; name: string; description: string }
  | { type: "loading" };

const AutocompletePopup = ({ id }: { id: string }) => {
  const itemz: Record<string, AutocompleteItem[]> = {
    test: [
      { type: "simple", value: "Rename to: test" },
      { type: "simple", value: "test" },
      { type: "simple", value: "hello world" },
    ],
    biomodels: [
      {
        type: "biomodel",
        name: "Test Biomodel Abc",
        description: "teatel apwefaweflawepf lwaepflawefl",
      },
      {
        type: "biomodel",
        name: "Test Biomodel",
        description: "teatel apwefaweflawepf lwaepflawefl",
      },
    ],
    hello: [{ type: "loading" }],
  };
  return (
    <ul id={id} className={styles.autocompletePopup} role="listbox">
      {Object.entries(itemz).map(([group, items]) => (
        <div key={group} className={styles.autocompleteGroup}>
          <h3 className={styles.autocompleteGroupTitle}>{group}</h3>
          {items.map((item) =>
            item.type === "simple" ? (
              <AutocompleteSimpleItem key={item.value} value={item.value} />
            ) : item.type === "biomodel" ? (
              <AutocompleteBiomodelItem
                key={item.name}
                name={item.name}
                description={item.description}
              />
            ) : item.type === "loading" ? (
              <AutocompleteLoadingItem key={group} />
            ) : null,
          )}
        </div>
      ))}
    </ul>
  );
};

const AutocompleteSimpleItem = ({ value }: { value: string }) => {
  return (
    <Button className={styles.autocompleteItem} style="ghost">
      {value}
    </Button>
  );
};

const AutocompleteBiomodelItem = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
  return (
    <Button style="ghost">
      <div
        className={clsx(
          styles.autocompleteItem,
          styles.autocompleteBiomodelItem,
        )}
      >
        <strong className={styles.biomodelName}>{name}</strong>
        <span className={styles.biomodelDescription}>{description}</span>
      </div>
    </Button>
  );
};

const AutocompleteLoadingItem = () => {
  return (
    <div className={styles.autocompleteLoadingItem}>
      <PulseLoader size="6px" />
    </div>
  );
};

export default WorkspaceBar;
