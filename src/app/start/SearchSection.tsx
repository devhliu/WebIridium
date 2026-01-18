import { useEffect, useState } from "react";
import styles from "./SearchSection.module.css";
import SearchBox from "@/components/input/SearchBox";
import {
  getSearchTypeFromSearchTerm,
  loadBiomodelSbml,
  useSearchBiomodels,
  type BiomodelInfo,
} from "@/features/biomodels";
import SearchItem from "./SearchItem";
import PulseLoader from "@/components/PulseLoader";
import { useFileSystemActions } from "@/globals/files";
import { convertSbmlToAntimony } from "@/features/antimony";

const LIMIT = 50;

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchType = searchTerm && getSearchTypeFromSearchTerm(searchTerm);

  const [openingModel, setOpeningModel] = useState<string | null>(null);
  const { createNewModel } = useFileSystemActions();
  const { biomodels, isLoading, error, searchBiomodels } = useSearchBiomodels();

  const handleSelectFor = (info: BiomodelInfo) => async () => {
    if (openingModel) {
      return;
    }

    setOpeningModel(info.id);
    try {
      const sbml = await loadBiomodelSbml(info);
      const antimony = await convertSbmlToAntimony(sbml);
      await createNewModel([info.name, antimony]);
    } finally {
      setOpeningModel(null);
    }
  };

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
            <SearchItem
              key={info.id}
              info={info}
              isEmphasizeId={searchType === "id"}
              isLoading={openingModel === info.id}
              onSelect={handleSelectFor(info)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSection;
