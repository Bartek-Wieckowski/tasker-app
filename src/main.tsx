import React from "react";
import ReactDOM from "react-dom/client";
import "./lib/i18n";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { Toaster } from "./components/ui/toaster";

import "./lib/pushNotifications";

<<<<<<< HEAD
// Prosta rejestracja service workera z push notifications
if ("serviceWorker" in navigator) {
  console.log("🔧 Service Worker is supported");
=======
if ("serviceWorker" in navigator) {
  if (import.meta.env.DEV) {
    console.log("🔧 Service Worker is supported");
  }
>>>>>>> origin/main

  navigator.serviceWorker
    .register("/sw-custom.js")
    .then((registration) => {
<<<<<<< HEAD
      console.log("✅ SW registered:", registration.scope);
      return navigator.serviceWorker.ready;
    })
    .then((registration) => {
      console.log("✅ SW ready and active:", registration.scope);
=======
      if (import.meta.env.DEV) {
        console.log("✅ SW registered:", registration.scope);
      }
      return navigator.serviceWorker.ready;
    })
    .then((registration) => {
      if (import.meta.env.DEV) {
        console.log("✅ SW ready and active:", registration.scope);
      }
>>>>>>> origin/main
    })
    .catch((error) => {
      console.error("❌ SW registration failed:", error);
    });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
<<<<<<< HEAD
    console.log("🔧 SW Controller changed");
  });
} else {
  console.log("❌ Service Worker not supported");
=======
    if (import.meta.env.DEV) {
      console.log("🔧 SW Controller changed");
    }
  });
} else {
  if (import.meta.env.DEV) {
    console.log("❌ Service Worker not supported");
  }
>>>>>>> origin/main
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster />
    </ErrorBoundary>
  </React.StrictMode>
);
