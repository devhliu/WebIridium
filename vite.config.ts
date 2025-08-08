/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://medium.com/@vitor.vicen.te/setting-up-path-aliases-in-a-vite-typescript-react-project-the-ultimate-way-d2a9a8ff7c63
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/WebIridium",
  plugins: [react(), svgr(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  assetsInclude: ["**/*.ant"],

  build: {
    // for whatever reason, vite moves stuff in our public/ directory to assets/ only on build. This messes up libantimony and libcopasi since they can't be imported at their regular path, so we have to disable this feature.
    assetsDir: "",
  },

  test: {
    alias: [
      // https://github.com/vitest-dev/vitest/discussions/1806
      {
        find: /^monaco-editor$/,
        replacement:
          __dirname + "/node_modules/monaco-editor/esm/vs/editor/editor.api",
      },
    ],
    setupFiles: ["./src/vitestSetup.ts"],
    environment: "jsdom",
    coverage: {
      include: ["src"],
      exclude: [
        "**/__mocks__/**",
        "src/icons/",
        "src/assets",
        "src/testing-utils",
        "src/third-party/",
      ],
    },
  },
});
