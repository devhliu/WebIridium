import chroma from "chroma-js";

export const DEFAULT_PALETTE = [
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

/**
 * Infinite generator that gives you colors from
 * the default palette.
 */
// eslint-disable-next-line
export function* generateDefaultPalette() {
  let i = 0;
  while (true) {
    const color = chroma(DEFAULT_PALETTE[i++ % DEFAULT_PALETTE.length]);
    const [h, s, v] = color.hsv();
    yield {
      color: color.hex("rgb"),
      // spin the color a little so its slightly different
      secondaryColor: chroma((h + 30) % 360, s, v, "hsv")
        .darken(2.5)
        .hex("rgb"),
    };
  }
}

export const getParameterScanColor = (
  color: string,
  secondaryColor: string,
  scanPercent: number,
) => {
  return chroma.mix(color, secondaryColor, scanPercent, "oklab").hex("rgb");
};
