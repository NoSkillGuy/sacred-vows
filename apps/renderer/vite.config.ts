import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: "src/render.ts",
    outDir: "dist-ssr",
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  resolve: {
    alias: [
      // Stub builder-specific services for renderer (editing features not used in SSR)
      // These must come before the general @shared alias
      {
        find: "@shared/store/builderStore",
        replacement: path.resolve(__dirname, "src/stub-builderStore.ts"),
      },
      {
        find: "@shared/services/assetService",
        replacement: path.resolve(__dirname, "src/stub-assetService.ts"),
      },
      {
        find: "@shared/components/Toast/ToastProvider",
        replacement: path.resolve(__dirname, "src/stub-ToastProvider.tsx"),
      },
      {
        find: "@shared",
        replacement: path.resolve(__dirname, "../shared/src"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  ssr: {
    // Bundle all dependencies to avoid requiring node_modules at runtime
    // This is important for Docker deployments where we only copy dist-ssr
    // Use regex to match react and react-dom (including subpath exports like react-dom/server)
    noExternal: [
      "@wedding-builder/shared",
      /^react/,
      /^react-dom/,
    ],
  },
});

