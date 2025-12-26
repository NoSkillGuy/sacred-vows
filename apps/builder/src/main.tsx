import "zone.js";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { queryClient } from "./lib/queryClient";
import { initObservability } from "./lib/observability";
import { ObservabilityRouter } from "./lib/observabilityRouter";
import { initMetricsAfterObservability } from "./lib/metrics";
import "./styles/index.css";
// Invitation styles are loaded in PreviewPane to avoid conflicts with builder UI

// Initialize observability and metrics before React render
Promise.all([initObservability(), initMetricsAfterObservability()]).catch((error) => {
  console.error("[App] Failed to initialize observability:", error);
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ObservabilityRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ObservabilityRouter>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
