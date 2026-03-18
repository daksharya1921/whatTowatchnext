import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import StartupError from "./components/StartupError";

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Critical: 'root' element not found in DOM.");
} else {
  try {
    const isConfigMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (isConfigMissing) {
      createRoot(rootElement).render(<StartupError message="Missing Supabase environment variables." />);
    } else {
      createRoot(rootElement).render(<App />);
    }
  } catch (error) {
    console.error("Application failed to mount:", error);
    createRoot(rootElement).render(<StartupError error={error as Error} />);
  }
}
