import { atom } from "jotai";

export const LEFT_PANELS = [
  "Time Course",
  "Steady State",
  "Parameter Scan",
  "History",
  "Examples",
] as const;
export const RIGHT_PANELS = ["Results"] as const;
export const VERY_RIGHT_PANELS = ["Plot Settings"] as const;
export const BOTTOM_PANELS = ["Sliders"] as const;

const STARTING_LEFT_PANEL: LeftPanel = "Time Course";

export type LeftPanel = (typeof LEFT_PANELS)[number];
export type RightPanel = (typeof RIGHT_PANELS)[number];
export type VeryRightPanel = (typeof VERY_RIGHT_PANELS)[number];
export type BottomPanel = (typeof BOTTOM_PANELS)[number];

const _currentVeryRightPanelAtom = atom<VeryRightPanel | null>(null);
// used to restore the left panel after its closed by opening the very right panel (via Plot Settings as of july)
const _lastLeftPanelAtom = atom<LeftPanel | null>(STARTING_LEFT_PANEL);
const _currentLeftPanelAtom = atom<LeftPanel | null>(STARTING_LEFT_PANEL);
const _currentRightPanelAtom = atom<RightPanel | null>(null);

export const currentLeftPanelAtom = atom(
  (get) => get(_currentLeftPanelAtom),
  (_, set, panel: LeftPanel | null) => {
    set(_lastLeftPanelAtom, panel);
    set(_currentLeftPanelAtom, panel);
  },
);

// also want to close the very right panel since it is bound to this one (b/c of Plot Settings as of july)
export const currentRightPanelAtom = atom(
  (get) => get(_currentRightPanelAtom),
  (get, set, panel: RightPanel | null) => {
    if (get(currentVeryRightPanelAtom) === "Plot Settings") {
      set(currentVeryRightPanelAtom, null);
    }
    set(_currentRightPanelAtom, panel);
  },
);

export const currentBottomPanelAtom = atom<BottomPanel | null>(null);

export const currentVeryRightPanelAtom = atom(
  (get) => get(_currentVeryRightPanelAtom),
  (get, set, panel: VeryRightPanel | null) => {
    if (panel === null) {
      // restore the left panel when closing
      set(_currentLeftPanelAtom, get(_lastLeftPanelAtom));
    } else {
      // close the left panel if it's visible to conserve space
      set(_currentLeftPanelAtom, null);
    }

    set(_currentVeryRightPanelAtom, panel);
  },
);
