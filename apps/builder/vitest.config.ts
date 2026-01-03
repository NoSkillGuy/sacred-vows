import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache", "tests/e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/tests/",
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
        find: "@shared/utils/assetService",
        replacement: path.resolve(__dirname, "./src/services/defaultAssetService"),
      },
      {
        find: "@shared/services/assetService",
        replacement: path.resolve(__dirname, "./src/services/assetService"),
      },
      {
        find: "@shared/components/Toast/ToastProvider",
        replacement: path.resolve(__dirname, "./src/components/Toast/ToastProvider"),
      },
      {
        find: "@shared/store/builderStore",
        replacement: path.resolve(__dirname, "./src/store/builderStore"),
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
