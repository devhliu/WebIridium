import { atom } from "jotai";

export const LEFT_PANELS = [
  "Time Course",
  "Steady State",
  "Parameter Scan",
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
      set(_currentLeftPanelAtom, get(_lastLeftPanelAtom));
    } else {
      set(_currentLeftPanelAtom, null);
    }

    set(_currentVeryRightPanelAtom, panel);
  },
);

export const layoutAtoms = [
  _currentVeryRightPanelAtom,
  _lastLeftPanelAtom,
  _currentLeftPanelAtom,

  currentLeftPanelAtom,
  currentRightPanelAtom,
  currentBottomPanelAtom,
  currentVeryRightPanelAtom,
];
