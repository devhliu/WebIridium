export type Theme = "light" | "dark";

const TRANSITION_CLASS = "theme-in-transition";

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
  document.documentElement.classList.add(TRANSITION_CLASS);

  document.documentElement.dataset.theme = theme;

  setTimeout(() => {
    document.documentElement.classList.remove(TRANSITION_CLASS);
  }, 600);
};
