import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App.tsx";
import { getPreferredTheme, setTheme } from "./features/theme";

setTheme(getPreferredTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
