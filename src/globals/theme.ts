import { atom } from "jotai";

import { getPreferredTheme, setTheme, type Theme } from "@/features/theme";

// theme

const doThemeUpdate = (theme: Theme) => {
  setTheme(theme);
};

doThemeUpdate(getPreferredTheme());

const _themeAtom = atom<Theme>(getPreferredTheme());
export const themeAtom = atom(
  (get) => get(_themeAtom),
  (_get, set, theme: Theme) => {
    set(_themeAtom, theme);
    doThemeUpdate(theme);
  },
);
export const toggleThemeAtom = atom(null, (get, set) => {
  if (get(themeAtom) === "light") {
    set(themeAtom, "dark");
  } else {
    set(themeAtom, "light");
  }
});
