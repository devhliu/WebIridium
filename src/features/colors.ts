import chroma from "chroma-js";

export type Palette = keyof typeof PALETTES | "Custom";

/** The colors you get by default when using custom palette. */
export const DEFAULT_CUSTOM_PALETTE = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

export const PALETTES = {
  BlueRed: { start: "#0000FF", end: "#FF0000" },
  RedGreen: { start: "#FF0000", end: "#00FF00" },
  BlackWhite: { start: "#000000", end: "#FFFFFF" },
  SunSet: { start: "#FF4500", end: "#FFD700" },
  CosmicFusion: { start: "#800080", end: "#8A2BE2" },
  Nepal: { start: "#7F7F7F", end: "#708090" },
  AzurePop: { start: "#00FFFF", end: "#008080" },
  GreenPale: { start: "#98FB98", end: "#32CD32" },
  GreyShades: { start: "#A9A9A9", end: "#696969" },
  Jupiter: { start: "#FF6347", end: "#FF4500" },
  Sherbert: { start: "#FF69B4", end: "#FFB6C1" },
  RedBlack: { start: "#FF0000", end: "#000000" },
  Timber: { start: "#D2B48C", end: "#8B4513" },
  OceanBlue: { start: "#1E90FF", end: "#4682B4" },
} as const;

/**
 * Infinite generator that gives you colors from
 * the default palette.
 */
// eslint-disable-next-line
export function* generateDefaultCustomPalette() {
  let i = 0;
  while (true) {
    yield DEFAULT_CUSTOM_PALETTE[i++ % DEFAULT_CUSTOM_PALETTE.length];
  }
}

/** Color gradient for a variable when you use custom color palette. */
export const getDefaultParameterScanColor = (
  color: string,
  scanPercent: number,
): string => {
  const startColor = chroma(color);
  const [h, s, v] = startColor.hsv();
  const targetColor = chroma((h + 30) % 360, s, v, "hsv")
    .darken(2.5)
    .hex("rgb");
  return chroma.mix(startColor, targetColor, scanPercent, "oklab").hex("rgb");
};

export const getPaletteColor = (
  palette: Exclude<Palette, "Custom">,
  percent: number,
): string => {
  return chroma
    .mix(PALETTES[palette].start, PALETTES[palette].end, percent, "oklab")
    .hex("rgb");
};
