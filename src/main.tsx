import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./monacoSetup.ts";
import "./echartsSetup.ts";

import App from "@/app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
