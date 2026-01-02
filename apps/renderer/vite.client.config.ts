import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-client",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/entry-client.tsx"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});

