import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
// Vite's loadEnv loads .env files and makes VITE_ prefixed vars available
const env = loadEnv(process.env.MODE || "development", process.cwd(), "");

// Check if CDN is configured (dev/prod environments)
const isCDNConfigured = !!env.VITE_PUBLIC_ASSETS_CDN_URL;

// Custom plugin to copy only sw.js and manifest.json when CDN is configured
const selectivePublicCopyPlugin = () => {
  return {
    name: "selective-public-copy",
    writeBundle() {
      if (isCDNConfigured) {
        const publicDir = resolve(__dirname, "public");
        const distDir = resolve(__dirname, "dist");

        // Ensure dist directory exists
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }

        // Copy only sw.js and manifest.json
        const filesToCopy = ["sw.js", "manifest.json"];
        filesToCopy.forEach((file) => {
          const src = resolve(publicDir, file);
          const dest = resolve(distDir, file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`Copied ${file} to dist`);
          }
        });
      }
    },
  };
};

const isProduction = process.env.NODE_ENV === "production" || env.MODE === "production";

// Resolve @shared path - handle both local and docker environments
// In docker: workspace root is mounted at /workspace, so shared is at /workspace/apps/shared/src
// In local: shared is at ../shared/src from builder
const resolveSharedPath = () => {
  const relativePath = path.resolve(__dirname, "../shared/src");
  const dockerWorkspacePath = "/workspace/apps/shared/src";
  const dockerLegacyPath = "/shared/src"; // Legacy path for old docker setup

  // Check if docker workspace path exists (new workspace root mount)
  if (existsSync(dockerWorkspacePath)) {
    return dockerWorkspacePath;
  }
  // Check if legacy docker path exists (old separate mount)
  if (existsSync(dockerLegacyPath)) {
    return dockerLegacyPath;
  }
  return relativePath;
};

export default defineConfig({
  plugins: [react(), selectivePublicCopyPlugin()],
  resolve: {
    alias: [
      {
        find: "@shared/utils/assetService",
        replacement: path.resolve(__dirname, "./src/services/defaultAssetService"),
      },
      // Alias for builder-specific services used by shared layouts
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
        replacement: path.resolve(resolveSharedPath(), "$1"),
      },
      {
        find: "@shared",
        replacement: resolveSharedPath(),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    // Ensure .ts and .tsx extensions are resolved
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: ["@opentelemetry/resources", "@wedding-builder/shared"],
  },
  // Only use publicDir in local development (when CDN is not configured)
  publicDir: isCDNConfigured ? false : "public",
  build: {
    // Remove source maps in production for code protection
    sourcemap: !isProduction,
    minify: isProduction ? "terser" : false,
    terserOptions: isProduction
      ? {
          compress: {
            drop_console: false, // Keep console for protection warnings
            drop_debugger: true,
            passes: 2,
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/,
            },
          },
          format: {
            comments: false,
          },
        }
      : undefined,
    // Additional obfuscation can be added via vite-plugin-obfuscator if needed
    // See: https://github.com/feat-agency/vite-plugin-obfuscator
  },
  server: {
    host: "0.0.0.0", // Bind to all interfaces for Docker
    port: 5173,
    watch: {
      // Use polling for Docker volume mounts (file system events may not work)
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        // Use VITE_API_PROXY_TARGET if set (for Docker), otherwise extract from VITE_API_URL
        // In Docker: VITE_API_PROXY_TARGET=http://api-go:3000 (Docker service name works in Node.js)
        // In local: VITE_API_URL=http://localhost:3000/api, extract base URL
        target:
          env.VITE_API_PROXY_TARGET ||
          (env.VITE_API_URL && env.VITE_API_URL.includes("/api")
            ? env.VITE_API_URL.replace("/api", "")
            : "http://localhost:3000"),
        changeOrigin: true,
      },
    },
  },
});
