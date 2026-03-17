// vite.config.ts
import { defineConfig } from "file:///C:/Users/daksh/Downloads/whatTowatchnext-main/whatTowatchnext-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/daksh/Downloads/whatTowatchnext-main/whatTowatchnext-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/daksh/Downloads/whatTowatchnext-main/whatTowatchnext-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\daksh\\Downloads\\whatTowatchnext-main\\whatTowatchnext-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    chunkSizeWarningLimit: 1e3,
    cssMinify: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/")) {
            return "vendor";
          }
          if (id.includes("node_modules/@radix-ui/")) {
            return "radix-ui";
          }
          if (id.includes("node_modules/framer-motion/")) {
            return "motion";
          }
          if (id.includes("node_modules/recharts/")) {
            return "charts";
          }
          if (id.includes("node_modules/@supabase/")) {
            return "supabase";
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkYWtzaFxcXFxEb3dubG9hZHNcXFxcd2hhdFRvd2F0Y2huZXh0LW1haW5cXFxcd2hhdFRvd2F0Y2huZXh0LW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGRha3NoXFxcXERvd25sb2Fkc1xcXFx3aGF0VG93YXRjaG5leHQtbWFpblxcXFx3aGF0VG93YXRjaG5leHQtbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZGFrc2gvRG93bmxvYWRzL3doYXRUb3dhdGNobmV4dC1tYWluL3doYXRUb3dhdGNobmV4dC1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICAvLyBDb3JlIFJlYWN0IHJ1bnRpbWUgXHUyMDE0IHNtYWxsZXN0IHBvc3NpYmxlIGluaXRpYWwgY2h1bmtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvcmVhY3QvXCIpIHx8IGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9cIikgfHwgaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvcmVhY3Qtcm91dGVyLWRvbS9cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInZlbmRvclwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBBbGwgUmFkaXggVUkgcHJpbWl0aXZlcyB0b2dldGhlciAodHJlZS1zaGFrZWFibGUsIGJ1dCBncm91cGVkIGZvciBjYWNoaW5nKVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9AcmFkaXgtdWkvXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJyYWRpeC11aVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBIZWF2eSBhbmltYXRpb24gbGlicmFyeSBcdTIwMTQgb25seSBuZWVkZWQgd2hlbiBhbmltYXRpb25zIHJ1blxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9mcmFtZXItbW90aW9uL1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwibW90aW9uXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIENoYXJ0aW5nIFx1MjAxNCBvbmx5IG9uIGFuYWx5dGljcyBwYWdlXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlY2hhcnRzL1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiY2hhcnRzXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFN1cGFiYXNlIFNESyBcdTIwMTQgYXV0aC1yZWxhdGVkIHBhZ2VzIG9ubHlcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvQHN1cGFiYXNlL1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwic3VwYWJhc2VcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1ksU0FBUyxvQkFBb0I7QUFDamEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLElBQ3ZCLFdBQVc7QUFBQSxJQUNYLHNCQUFzQjtBQUFBLElBQ3RCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUVmLGNBQUksR0FBRyxTQUFTLHFCQUFxQixLQUFLLEdBQUcsU0FBUyx5QkFBeUIsS0FBSyxHQUFHLFNBQVMsZ0NBQWdDLEdBQUc7QUFDakksbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMseUJBQXlCLEdBQUc7QUFDMUMsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsNkJBQTZCLEdBQUc7QUFDOUMsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsd0JBQXdCLEdBQUc7QUFDekMsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMseUJBQXlCLEdBQUc7QUFDMUMsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
