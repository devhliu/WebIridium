import { atom } from "jotai";
import * as monaco from "monaco-editor";

import { getPreferredTheme, setTheme, type Theme } from "@/features/theme";

const doThemeUpdate = (theme: Theme) => {
  if (theme === "light") {
    monaco.editor.setTheme("iridiumLight");
  } else {
    monaco.editor.setTheme("iridiumDark");
  }

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
