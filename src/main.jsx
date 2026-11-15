import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { TelemetryProvider } from "./state/TelemetryContext";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TelemetryProvider>
      <App />
    </TelemetryProvider>
  </React.StrictMode>
);
