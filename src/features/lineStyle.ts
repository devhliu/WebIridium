export const LINE_STYLES = [
  "solid",
  "dash",
  "dot",
  "dashdot",
  "longdash",
  "longdashdot",
] as const;

export type LineStyle = (typeof LINE_STYLES)[number];

export const DASH_ARRAYS: Record<LineStyle, number[]> = {
  solid: [],
  dash: [5, 5],
  dot: [2, 2],
  dashdot: [5, 5, 2, 5],
  longdash: [10, 5],
  longdashdot: [10, 5, 2, 5],
};
