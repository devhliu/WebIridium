export type Theme = "light" | "dark";

export const getPreferredTheme = (): Theme => {
  // https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  } else {
    return "light";
  }
};

export const getTheme = () => {
  return document.documentElement.dataset.theme;
};

export const setTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};
