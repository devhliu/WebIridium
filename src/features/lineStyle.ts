export const LINE_STYLES = [
  "solid",
  "dash",
  "dot",
  "dashdot",
  "longdash",
  "longdashdot",
] as const;

export type LineStyle = (typeof LINE_STYLES)[number];
