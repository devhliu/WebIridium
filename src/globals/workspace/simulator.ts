/**
 * Atoms for the current simulator instance and its name.
 */

import { atom } from "jotai";

import { type Simulator } from "@/features/simulation/Simulator";
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";
import { LibSbmlSimSimulator } from "@/features/simulation/LibSbmlSimSimulator";

import { editorContentAtom, updateEditorContentAtom } from "./model";

export const SIMULATOR_PRODUCERS: Record<string, () => Simulator> = {
  COPASI: () => new CopasiSimulator(),
  libsbmlsim: () => new LibSbmlSimSimulator(),
};
export const SIMULATOR_LIST = Object.keys(SIMULATOR_PRODUCERS);

export const getSimulatorName = (simulator: Simulator): string => {
  if (simulator instanceof CopasiSimulator) {
    return "COPASI";
  } else {
    return "libsbmlsim";
  }
};

const _simulatorAtom = atom<Simulator>(new CopasiSimulator());

export const simulatorAtom = atom((get) => get(_simulatorAtom));
export const updateSimulatorAtom = atom(null, (get, set, name: string) => {
  const currentSimulator = get(_simulatorAtom);
  if (getSimulatorName(currentSimulator) !== name) {
    set(_simulatorAtom, SIMULATOR_PRODUCERS[name]());

    // force model reload
    void set(updateEditorContentAtom, {
      content: get(editorContentAtom),
      skipDebounce: true,
    });
  }
});

export const simulatorAtoms = [
  _simulatorAtom,
  simulatorAtom,
  updateSimulatorAtom,
];
