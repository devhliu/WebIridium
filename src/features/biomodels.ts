export interface ModelInfo {
  name: string;
  authors: string[];
  url: string;
  id: string;
  title: string;
  synopsis: string;
  citation: string | null;
  date: string;
  journal: string;
}

type SearchType =
  /** search using author, title, synopsis, date, or journal */
  | "standard"
  /** search using biomodel number/id */
  | "id";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

// Promise that will resolve to the cache. Should not be used directly,
// use `loadCache` instead.
let cachePromise: Promise<Record<string, ModelInfo>> | null = null;

/**
 * @returns the biomodel cache
 */
const loadCache = (): Promise<Record<string, ModelInfo>> => {
  if (!cachePromise) {
    cachePromise = import("@/assets/biomodelsCache.json").then((result) =>
      Object.values(result.default).map((info) => ({
        name: info.name,
        authors: info.authors,
        url: info.url,
        id: info.model_id,
        title: info.title,
        synopsis: info.synopsis,
        citation: info.citation,
        date: info.date,
        journal: info.journal,
      })),
    ) as unknown as Promise<Record<string, ModelInfo>>;
  }
  return cachePromise;
};

const getSearchTypeFromSearchTerm = (term: string): SearchType => {
  if (!isNaN(+term)) {
    return "id";
  } else {
    return "standard";
  }
};

/** make sure to normalize search term before use for best results */
const doesModelMatchTerm = (
  searchTerm: string,
  modelInfo: ModelInfo,
): boolean => {
  // cbeck authors
  if (
    modelInfo.authors.some((name) => name.toLowerCase().includes(searchTerm))
  ) {
    return true;
  }

  // check any of the other stuff
  if (
    Object.values(modelInfo).some(
      (value) =>
        typeof value === "string" && value.toLowerCase().includes(searchTerm),
    )
  ) {
    return true;
  }

  return false;
};

/**
 * @param term - the search term
 * @param limit - max number of results to return
 * @param signal - use this to abort the search
 * @returns biomodels matching the search term
 */
export const searchModels = async (
  term: string,
  limit: number,
  signal?: AbortSignal,
): Promise<ModelInfo[]> => {
  const results: ModelInfo[] = [];
  const cache = await loadCache();
  const searchType = getSearchTypeFromSearchTerm(term);
  const normalizedTerm = term.toLowerCase().trim();

  // might've been aborted while loading the cache
  if (signal?.aborted) {
    return results;
  }

  // pretty much the same code except for the if statement to check if the term matches
  // but I split it up into two paths as a micro-optimization to avoid an if check for the
  // searchType
  if (searchType === "id") {
    for (const modelInfo of Object.values(cache)) {
      if (results.length >= limit) {
        break;
      }

      if (modelInfo.id.includes(term)) {
        results.push(modelInfo);
      }
    }
  } else {
    for (const modelInfo of Object.values(cache)) {
      if (results.length >= limit) {
        break;
      }

      if (doesModelMatchTerm(normalizedTerm, modelInfo)) {
        results.push(modelInfo);
      }
    }
  }

  return results;
};

const getModelContentUrl = (modelInfo: ModelInfo): string =>
  `https://api.github.com/repos/sys-bio/BiomodelsStore/contents/biomodels/${modelInfo.id}`;

/**
 * @returns SBML for the given model.
 * @throws Error - whenever the biomodel fails to load for whatever reason
 */
export const loadModelSbml = async (
  modelInfo: ModelInfo,
  signal?: AbortSignal,
): Promise<string> => {
  const infoResult = await fetch(getModelContentUrl(modelInfo), {
    signal,
    headers: GITHUB_HEADERS,
  });
  if (!infoResult.ok) {
    throw new Error(
      `Failed to fetch model resource info ${infoResult.status} ${infoResult.statusText}`,
    );
  }

  const infoJson: unknown = await infoResult.json();
  if (!Array.isArray(infoJson)) {
    throw new Error("Unexpected JSON");
  }

  // An array is returned with data for each element in the folder.
  // The first item is the xml file with the SBML.
  const sbmlFileInfo: unknown = infoJson[0];
  if (typeof sbmlFileInfo !== "object" || sbmlFileInfo === null) {
    throw new Error("Missing sbml file?");
  }

  if (
    !("download_url" in sbmlFileInfo) ||
    typeof sbmlFileInfo.download_url !== "string"
  ) {
    throw new Error("Missing download url");
  }

  const sbmlResult = await fetch(sbmlFileInfo.download_url, {
    signal,
    headers: GITHUB_HEADERS,
  });
  if (!sbmlResult.ok) {
    throw new Error(
      `Failed to fetch model contents ${sbmlResult.status} ${sbmlResult.statusText}`,
    );
  }

  return sbmlResult.text();
};
