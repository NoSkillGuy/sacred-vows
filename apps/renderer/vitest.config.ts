import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/",
        "**/coverage/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@shared/services/assetService",
        replacement: path.resolve(__dirname, "./src/stub-assetService.ts"),
      },
      {
        find: "@shared/components/Toast/ToastProvider",
        replacement: path.resolve(__dirname, "./src/stub-ToastProvider.tsx"),
      },
      {
        find: "@shared/store/builderStore",
        replacement: path.resolve(__dirname, "./src/stub-builderStore.ts"),
      },
      {
        find: /^@shared\/(.*)$/,
        replacement: path.resolve(__dirname, "../shared/src/$1"),
      },
      {
        find: "@shared",
        replacement: path.resolve(__dirname, "../shared/src"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
});
