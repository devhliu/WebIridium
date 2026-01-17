/**
 * Read `DEVINSTRUCTIONS/MIGRATIONS.md` for how this works/how to add your own migrations.
 */

import type { MetadataV1 } from "./migrations/metadata/v1";
import type { IridiumDataV1 } from "./migrations/iridium/v1";
import type { ResultsDataV1 } from "./migrations/results/v1";

// Should be union of every single version
export type UnknownMetadata = MetadataV1;
export type UnknownIridiumData = IridiumDataV1;
export type UnknownResultsData = ResultsDataV1;

// Keep these up-to-date with the latest versions
export type Metadata = MetadataV1;
/**
 * Iridium data is any model data that is specific to the app, such as variable/graph settings.
 */
export type IridiumData = IridiumDataV1;
export type ResultsData = ResultsDataV1;

// https://www.learningtypescript.com/articles/branded-types
export type ModelId = string & { __brand: "modelId" };

export interface UnknownModelData {
  metadata: UnknownMetadata;
  iridium: UnknownIridiumData;
  results: UnknownResultsData;
  code: string;
}

export interface ModelData {
  metadata: Metadata;
  iridium: IridiumData;
  results: ResultsData;
  code: string;
}

/**
 * @param metadata - Metadata of any version.
 * @returns The original metadata migrated to the latest version.
 */
export const migrateMetadata = (metadata: UnknownMetadata): Metadata => {
  switch (metadata.versionTag) {
    case 1: {
      return metadata;
    }
  }
};

/**
 * @param iridiumData - Iridium data of any version.
 * @returns The original iridium data migrated to the latest version.
 */
export const migrateIridiumData = (
  iridiumData: UnknownIridiumData,
): IridiumData => {
  switch (iridiumData.versionTag) {
    case 1: {
      return iridiumData;
    }
  }
};

/**
 * @param resultsData - Results data of any version.
 * @returns The original results data migrated to the latest version.
 */
export const migrateResultsData = (
  resultsData: UnknownResultsData,
): ResultsData => {
  switch (resultsData.versionTag) {
    case 1: {
      return resultsData;
    }
  }
};
