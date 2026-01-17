import { atom, type Atom } from "jotai";
import { loadable } from "jotai/utils";
import {
  migrateMetadata,
  type Metadata,
  type ModelId,
} from "@/features/savedData";
import { listModels } from "@/features/fileSystem";

// Increments every time a change is made to the file system
// Other atoms should `get` this if they want to re-evaluate when the file system changes.
const _changeIdAtom = atom(0);

const _modelListAtom: Atom<Promise<Map<ModelId, Metadata>>> = atom(
  async (get) => {
    // do this to update the atom on any file system changes
    get(_changeIdAtom);

    const models = await listModels();
    const migratedModels = new Map(
      Array.from(models.entries()).map(([id, metadata]) => [
        id,
        migrateMetadata(metadata),
      ]),
    );

    return migratedModels;
  },
);
export const modelListAtom = loadable(_modelListAtom);
