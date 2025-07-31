/**
 * EditorActionsDispatcher is an object that should be instantiated by whatever component creates the Monaco component (EditorPanel).
 * It provides actions you can call to manipulate the code/Monaco instance.
 */

import { atom } from "jotai";

export interface EditorActionsDispatcher {
  addPresetAsComment: (
    name: string,
    presets: { [variable: string]: number },
  ) => void;
}

export const editorActionsDispatcherAtom = atom<EditorActionsDispatcher | null>(
  null,
);

export const editorActionsAtoms = [editorActionsDispatcherAtom];
