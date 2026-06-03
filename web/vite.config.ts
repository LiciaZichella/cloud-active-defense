import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // In sviluppo inoltra le chiamate /api al backend FastAPI (porta 8000)
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
