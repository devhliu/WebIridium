import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const DARK_KEYWORD_COLOR = "#77dce0";
const DARK_KEYWORD2_COLOR = "#5adb8e";

export const iridiumDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: false,
  colors: {
    "editor.background": "#1a1e24",
    "editor.foreground": "#e6e8eb",
    "editorLineNumber.foreground": "#5e6673",
    "editorLineNumber.activeForeground": "#c1c8d4",
    "editor.selectionBackground": "#283e5e",
  },
  rules: [
    { token: "species", foreground: DARK_KEYWORD_COLOR },

    { token: "compartment", foreground: DARK_KEYWORD_COLOR },

    { token: "const", foreground: DARK_KEYWORD_COLOR },

    { token: "unit", foreground: DARK_KEYWORD_COLOR },

    { token: "var", foreground: DARK_KEYWORD_COLOR },

    { token: "keywords", foreground: DARK_KEYWORD_COLOR },
    { token: "operator", foreground: "#84cbe3" },

    { token: "function", foreground: DARK_KEYWORD2_COLOR },
    { token: "model", foreground: DARK_KEYWORD2_COLOR },
    { token: "end", foreground: DARK_KEYWORD2_COLOR },

    { token: "transform", foreground: "#81bdeb" },

    { token: "annotation", foreground: DARK_KEYWORD_COLOR },

    { token: "assign", foreground: "#81bdeb" },

    // { token: 'other', foreground: KEYWORD_COLOR },
    { token: "react-remov", foreground: "#a6f7e8" },
    { token: "comment", foreground: "#6b967c" },
    { token: "string", foreground: "#e3df8a" },
    { token: "number", foreground: "#f7bd7e" },
  ],
};

const LIGHT_KEYWORD_COLOR = "#038286";
const LIGHT_KEYWORD2_COLOR = "#2a7a4a";

export const iridiumLightTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: false,
  colors: {
    "editor.background": "#fefefe",
    "editor.foreground": "#111314",
    "editorLineNumber.foreground": "#969da8",
    "editorLineNumber.activeForeground": "#3c3f45",
    "editor.selectionBackground": "#a7d4f2",
  },
  rules: [
    { token: "species", foreground: LIGHT_KEYWORD_COLOR },

    { token: "compartment", foreground: LIGHT_KEYWORD_COLOR },

    { token: "const", foreground: LIGHT_KEYWORD_COLOR },

    { token: "unit", foreground: LIGHT_KEYWORD_COLOR },

    { token: "var", foreground: LIGHT_KEYWORD_COLOR },

    { token: "keywords", foreground: LIGHT_KEYWORD_COLOR },
    { token: "operator", foreground: "#1f87ab" },

    { token: "function", foreground: LIGHT_KEYWORD2_COLOR },
    { token: "model", foreground: LIGHT_KEYWORD2_COLOR },
    { token: "end", foreground: LIGHT_KEYWORD2_COLOR },

    { token: "transform", foreground: "#1d74b5" },

    { token: "annotation", foreground: LIGHT_KEYWORD_COLOR },

    { token: "assign", foreground: "#1d74b5" },

    // { token: 'other', foreground: KEYWORD_COLOR },
    { token: "react-remov", foreground: "#01856c" },
    { token: "comment", foreground: "#128741" },
    { token: "string", foreground: "#80780a" },
    { token: "number", foreground: "#b2610a" },
  ],
};
