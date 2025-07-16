import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import styles from "./WorkspaceBar.module.css";

import { useSearchBiomodels, type BiomodelInfo } from "@/features/biomodels";

import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

import { nameAtom } from "@/globals/workspace/settings";
import Button from "@/components/Button";
import PulseLoader from "@/components/PulseLoader";

type AutocompleteItems = { [group: string]: AutocompleteItem[] };

const ACTIONS_GROUP_NAME = "Actions";
const AUTOCOMPLETE_POPUP_ID = "workspaceBarAutocomplete";
const BIOMODELS_SEARCH_LIMIT = 25;

const isNameValid = (name: string): boolean => {
  return name.trim().length > 0;
};

const getFirstSentence = (synopysis: string): string =>
  synopysis.slice(0, synopysis.indexOf(".") + 1);

const getSelectedAutocompleteItemFromIndex = (
  items: AutocompleteItems,
  index: number,
) => {
  const flattenedItems = Object.values(items)
    .flat()
    .filter((item) => item.type !== "loading");
  return flattenedItems[index];
};

const decrementIndexFromItems = (
  items: AutocompleteItems,
  index: number,
): number => {
  if (index === 0) {
    const flattenedItems = Object.values(items)
      .flat()
      .filter((item) => item.type !== "loading");
    return flattenedItems.length - 1;
  } else {
    return index - 1;
  }
};

const incrementIndexFromItems = (
  items: Record<string, AutocompleteItem[]>,
  index: number,
): number => {
  const flattenedItems = Object.values(items)
    .flat()
    .filter((item) => item.type !== "loading");
  return (index + 1) % flattenedItems.length;
};

export const WorkspaceBar = () => {
  const [open, setOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useAtom(nameAtom);
  const [typing, setTyping] = useState("");

  const [selectedIndex, setSelectedIndex] = useState(0);

  const { biomodels, isLoading, searchBiomodels, cancelSearch } =
    useSearchBiomodels();

  const renameItem = {
    type: "simple",
    name: "Rename model to",
    value: typing,
  } as const;
  const items: Record<string, AutocompleteItem[]> = !typing
    ? {}
    : {
        [ACTIONS_GROUP_NAME]: isNameValid(typing) ? [renameItem] : [],
        Biomodels: isLoading
          ? [{ type: "loading" }]
          : biomodels.map((info) => ({ type: "biomodel", info })),
      };

  const openInput = () => {
    setOpen(true);
    setTyping("");
    setSelectedIndex(0);
  };

  const cancelInput = () => {
    setOpen(false);
    cancelSearch();
  };

  const handleInputBlur = cancelInput;

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isNameValid(typing)) {
        setOpen(false);
        setWorkspaceName(typing);
      } else {
        cancelInput();
      }
    } else if (e.key === "Escape") {
      cancelInput();
    } else if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => incrementIndexFromItems(items, prev));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => decrementIndexFromItems(items, prev));
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTyping = e.target.value;
    setTyping(newTyping);
    setSelectedIndex(0);

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
            selected={getSelectedAutocompleteItemFromIndex(
              items,
              selectedIndex,
            )}
            items={items}
          />
        )}
      </div>
    );
  }
};

type AutocompleteItem =
  | { type: "simple"; name: string; value: string }
  | { type: "biomodel"; info: BiomodelInfo }
  | { type: "loading" };

const AutocompletePopup = ({
  id,
  selected,
  items,
}: {
  id: string;
  selected: AutocompleteItem;
  items: Record<string, AutocompleteItem[]>;
}) => {
  const isEmpty = Object.values(items).every(
    (groupItems) => groupItems.length === 0,
  );
  if (isEmpty) {
    return (
      <ul id={id} className={styles.autocompletePopup} role="listbox">
        <p className={styles.noResults}>No results.</p>
      </ul>
    );
  } else {
    return (
      <ul id={id} className={styles.autocompletePopup} role="listbox">
        {Object.entries(items).map(([group, groupItems]) =>
          groupItems.length === 0 ? null : (
            <div key={group} className={styles.autocompleteGroup}>
              {/* special case for action group, don't show the title */}
              {group === ACTIONS_GROUP_NAME ? null : (
                <h3 className={styles.autocompleteGroupTitle}>{group}</h3>
              )}
              {groupItems.map((item) =>
                item.type === "simple" ? (
                  <AutocompleteSimpleItem
                    key={item.value}
                    name={item.name}
                    value={item.value}
                    selected={selected === item}
                  />
                ) : item.type === "biomodel" ? (
                  <AutocompleteBiomodelItem
                    key={item.info.id}
                    info={item.info}
                    selected={selected === item}
                  />
                ) : item.type === "loading" ? (
                  <AutocompleteLoadingItem key={group} />
                ) : null,
              )}
            </div>
          ),
        )}
      </ul>
    );
  }
};

const useFocusOnSelected = (
  buttonRef: React.RefObject<HTMLButtonElement | null>,
  selected: boolean,
) => {
  useEffect(() => {
    if (selected && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [buttonRef, selected]);
};

const AutocompleteSimpleItem = ({
  name,
  value,
  selected,
}: {
  name: string;
  value: string;
  selected: boolean;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useFocusOnSelected(buttonRef, selected);

  return (
    <li>
      <Button
        ref={buttonRef}
        className={styles.autocompleteItem}
        style="ghost"
        active={selected}
      >
        <b className={styles.autocompleteSimpleItemName}>{name}:</b>
        {value}
      </Button>
    </li>
  );
};

const AutocompleteBiomodelItem = ({
  info,
  selected,
}: {
  info: BiomodelInfo;
  selected: boolean;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useFocusOnSelected(buttonRef, selected);

  return (
    <li>
      <Button ref={buttonRef} style="ghost" active={selected}>
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
    </li>
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
