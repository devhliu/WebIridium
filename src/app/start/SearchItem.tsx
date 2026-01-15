import type { BiomodelInfo } from "@/features/biomodels";
import styles from "./SearchItem.module.css";
import { biomodelsDateToEnglish } from "@/features/formatUtils";

export interface SearchItemProps {
  info: BiomodelInfo;
}

const getFirstSentence = (synopysis: string): string =>
  synopysis.slice(0, synopysis.indexOf(".") + 1);

const SearchItem = ({ info }: SearchItemProps) => {
  return (
    <div className={styles.item}>
      <button className={styles.main}>
        <h4 className={styles.name}>
          {info.name}
          <span className={styles.number}> ({info.id})</span>
        </h4>
        <p className={styles.citation}>
          <span>{info.authors.join(", ")}</span>
          <span> - {info.journal}</span>
          <span>, {biomodelsDateToEnglish(info.date)})</span>
        </p>
        <p className={styles.synopsis}>{getFirstSentence(info.synopsis)}</p>
      </button>
    </div>
  );
};

export default SearchItem;
