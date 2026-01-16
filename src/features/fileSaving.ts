/**
 * Directory structure:
 *   \- models
 *      \- {model UUID}
 *        \- metadata.json: this contains the name, creation date, updated date
 *        \- iridium.json: WebIridium-specific parts of the model such as graph settings
 *        \- results.json: results stored from every simulation
 *        \- source.ant: the actual antimony
 *      \- {model UUID}: another model
 *        \- metadata.json
 *        \- iridium.json
 *        \- results.json
 *        \- source.ant
 */

import type { IridiumData, Metadata, ResultsData } from "./migration";

export interface ModelData {
  metadata: Metadata,
  iridium: IridiumData,
  results: ResultsData,
}

const MODELS_FOLDER_PATH = "models/";
