import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    cssMinify: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — smallest possible initial chunk
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/")) {
            return "vendor";
          }
          // All Radix UI primitives together (tree-shakeable, but grouped for caching)
          if (id.includes("node_modules/@radix-ui/")) {
            return "radix-ui";
          }
          // Heavy animation library — only needed when animations run
          if (id.includes("node_modules/framer-motion/")) {
            return "motion";
          }
          // Charting — only on analytics page
          if (id.includes("node_modules/recharts/")) {
            return "charts";
          }
          // Supabase SDK — auth-related pages only
          if (id.includes("node_modules/@supabase/")) {
            return "supabase";
          }
        },
      },
    },
  },
}));

