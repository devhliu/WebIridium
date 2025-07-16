import { atom } from "jotai";

export type SidebarTab =
  | "Time Course"
  | "Steady State"
  | "Parameter Scan"
  | "Examples"

  // these ones are not included in the sidebar or view tab since they must be opened in some other place
  | "Plot Settings";

export const SIDEBAR_TABS: SidebarTab[] = [
  "Time Course",
  "Steady State",
  "Parameter Scan",
  "Examples",
];

// these items appear on the top.
// every other item appears on the bottom
export const TOP_SIDEBAR_TABS = new Set<SidebarTab>([
  "Time Course",
  "Steady State",
  "Parameter Scan",
]);

export const currentSidebarTabAtom = atom<SidebarTab | null>("Time Course");
