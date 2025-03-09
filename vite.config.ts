import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/sodot-vertex-0": {
        target: "https://vertex-demo-0.sodot.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sodot-vertex-0/, ""),
      },
      "/sodot-vertex-1": {
        target: "https://vertex-demo-1.sodot.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sodot-vertex-1/, ""),
      },
      "/sodot-vertex-2": {
        target: "https://vertex-demo-2.sodot.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sodot-vertex-2/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
