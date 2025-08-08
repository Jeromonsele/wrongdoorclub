import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { LangProvider } from "@/i18n";

const root = document.getElementById("root")!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
);

// Register SW only in production
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = new URL("./sw.ts", import.meta.url);
    navigator.serviceWorker.register(swUrl, { type: "module" }).catch(() => {});
  });
}