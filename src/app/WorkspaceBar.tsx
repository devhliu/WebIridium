import clsx from "clsx";
import { useState } from "react";
import { useAtom } from "jotai";
import styles from "./WorkspaceBar.module.css";

import { useSearchBiomodels, type BiomodelInfo } from "@/features/biomodels";

import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

import { nameAtom } from "@/globals/workspace/settings";
import Button from "@/components/Button";
import PulseLoader from "@/components/PulseLoader";

const AUTOCOMPLETE_POPUP_ID = "workspaceBarAutocomplete";
const BIOMODELS_SEARCH_LIMIT = 25;

const isNameValid = (name: string): boolean => {
  return name.length > 0;
};

const getFirstSentence = (synopysis: string): string =>
  synopysis.slice(0, synopysis.indexOf(".") + 1);

export const WorkspaceBar = () => {
  const [open, setOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useAtom(nameAtom);
  const [typing, setTyping] = useState("");

  const { biomodels, isLoading, searchBiomodels, cancelSearch } =
    useSearchBiomodels();

  const openInput = () => {
    setOpen(true);
    setTyping("");
  };

  const cancelInput = () => {
    setOpen(false);
    cancelSearch();
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTyping = e.target.value;
    setTyping(newTyping);

    await searchBiomodels(newTyping, BIOMODELS_SEARCH_LIMIT);
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
          type="text"
          className={styles.input}
          autoFocus
          value={typing}
          placeholder="Rename your model or search for one"
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onChange={handleChange}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={typing.length > 0 ? AUTOCOMPLETE_POPUP_ID : undefined}
          aria-haspopup="listbox"
        />

        {typing.length > 0 && (
          <AutocompletePopup
            id={AUTOCOMPLETE_POPUP_ID}
            items={{
              Biomodels: isLoading
                ? [{ type: "loading" }]
                : biomodels.map((info) => ({ type: "biomodel", info })),
            }}
          />
        )}
      </div>
    );
  }
};

type AutocompleteItem =
  | { type: "simple"; value: string }
  | { type: "biomodel"; info: BiomodelInfo }
  | { type: "loading" };

const AutocompletePopup = ({
  id,
  items,
}: {
  id: string;
  items: Record<string, AutocompleteItem[]>;
}) => {
  return (
    <ul id={id} className={styles.autocompletePopup} role="listbox">
      {Object.entries(items).map(([group, groupItems]) =>
        groupItems.length === 0 ? null : (
          <div key={group} className={styles.autocompleteGroup}>
            <h3 className={styles.autocompleteGroupTitle}>{group}</h3>
            {groupItems.map((item) =>
              item.type === "simple" ? (
                <AutocompleteSimpleItem key={item.value} value={item.value} />
              ) : item.type === "biomodel" ? (
                <AutocompleteBiomodelItem key={item.info.id} info={item.info} />
              ) : item.type === "loading" ? (
                <AutocompleteLoadingItem key={group} />
              ) : null,
            )}
          </div>
        ),
      )}
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

const AutocompleteBiomodelItem = ({ info }: { info: BiomodelInfo }) => {
  return (
    <Button style="ghost">
      <div
        className={clsx(
          styles.autocompleteItem,
          styles.autocompleteBiomodelItem,
        )}
      >
        <strong className={styles.biomodelName}>{info.name}</strong>
        <span className={styles.biomodelSynopsis}>
          {getFirstSentence(info.synopsis)}
        </span>
        <span className={styles.biomodelExtra}>
          {info.id} | Authors: {info.authors.join(", ")} | Date: {info.date} |
          Journal: {info.journal}
        </span>
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
