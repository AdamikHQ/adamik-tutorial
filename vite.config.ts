import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/adamik-proxy": {
        target: "https://api-staging.adamik.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/adamik-proxy/, ""),
      },
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
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for Turnkey SDK to work
    global: "globalThis",
    process: {
      env: {},
    },
  },
}));
