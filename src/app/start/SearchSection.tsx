import { useEffect, useState } from "react";
import styles from "./SearchSection.module.css";
import SearchBox from "@/components/input/SearchBox";
import {
  getSearchTypeFromSearchTerm,
  useSearchBiomodels,
} from "@/features/biomodels";
import SearchItem from "./SearchItem";
import PulseLoader from "@/components/PulseLoader";

const LIMIT = 50;

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchType = searchTerm && getSearchTypeFromSearchTerm(searchTerm);

  const { biomodels, isLoading, error, searchBiomodels } = useSearchBiomodels();

  useEffect(() => {
    void searchBiomodels(searchTerm, LIMIT);
  }, [searchTerm, searchBiomodels]);

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>BioModels</h3>
      <SearchBox
        name="biomodelsSearch"
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Model Name or Number"
      />
      {isLoading ? (
        <div className={styles.loading}>
          <PulseLoader />
        </div>
      ) : error ? (
        <p className={styles.noResults}>Error: {error}</p>
      ) : biomodels.length === 0 ? (
        <p className={styles.noResults}>No results</p>
      ) : (
        <div className={styles.list}>
          {biomodels.map((info) => (
            <SearchItem info={info} isEmphasizeId={searchType === "id"} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSection;
