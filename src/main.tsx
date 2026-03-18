// @ts-ignore
alert("Script Initialization Started");
document.body.style.backgroundColor = "purple"; // Visible even if React fails

import { createRoot } from "react-dom/client";
import "./index.css";
import StartupError from "./components/StartupError";

// Immediate global error catching
window.onerror = function(msg, url, line, col, error) {
  console.error("Window Error:", msg, error);
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<StartupError message={String(msg)} error={error} />);
  }
  return false;
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled Rejection:", event.reason);
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<StartupError message="Unhandled Rejection" error={event.reason} />);
  }
};

/**
 * Robust initialization that catches top-level errors in dependencies
 * by using dynamic imports.
 */
async function init() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Critical: 'root' element not found in DOM.");
    return;
  }

  const root = createRoot(rootElement);

  try {
    // 1. Check for basic configuration
    const isConfigMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (isConfigMissing) {
      console.warn("Supabase configuration is missing. Showing error screen.");
      root.render(<StartupError message="Missing Supabase environment variables in the production environment." />);
      return;
    }

    // 2. Dynamic import App to catch any top-level errors in dependencies
    // (like failing library initializations or missing ESM bundles)
    const { default: App } = await import("./App");
    root.render(<App />);
    
    console.log("Application mounted successfully.");
  } catch (error) {
    console.error("Critical Startup Error:", error);
    root.render(<StartupError error={error as Error} />);
  }
}

init();
