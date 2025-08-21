import React from "react";
import ReactDOM from "react-dom/client";
import "./lib/i18n";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { Toaster } from "./components/ui/toaster";

import "./lib/pushNotifications";

// Prosta rejestracja service workera z push notifications
if ("serviceWorker" in navigator) {
  console.log("🔧 Service Worker is supported");

  navigator.serviceWorker
    .register("/sw-custom.js")
    .then((registration) => {
      console.log("✅ SW registered:", registration.scope);
      return navigator.serviceWorker.ready;
    })
    .then((registration) => {
      console.log("✅ SW ready and active:", registration.scope);
    })
    .catch((error) => {
      console.error("❌ SW registration failed:", error);
    });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("🔧 SW Controller changed");
  });
} else {
  console.log("❌ Service Worker not supported");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster />
    </ErrorBoundary>
  </React.StrictMode>
);
