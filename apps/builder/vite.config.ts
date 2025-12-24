import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
// Vite's loadEnv loads .env files and makes VITE_ prefixed vars available
const env = loadEnv(process.env.MODE || 'development', process.cwd(), '');

// Check if CDN is configured (dev/prod environments)
const isCDNConfigured = !!env.VITE_PUBLIC_ASSETS_CDN_URL;

// Custom plugin to copy only sw.js and manifest.json when CDN is configured
const selectivePublicCopyPlugin = () => {
  return {
    name: 'selective-public-copy',
    writeBundle() {
      if (isCDNConfigured) {
        const publicDir = resolve(__dirname, 'public');
        const distDir = resolve(__dirname, 'dist');
        
        // Ensure dist directory exists
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        
        // Copy only sw.js and manifest.json
        const filesToCopy = ['sw.js', 'manifest.json'];
        filesToCopy.forEach(file => {
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

export default defineConfig({
  plugins: [
    react(),
    selectivePublicCopyPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared/src'),
      '@template-engine': path.resolve(__dirname, './src/template-engine/src'),
    },
  },
  // Only use publicDir in local development (when CDN is not configured)
  publicDir: isCDNConfigured ? false : 'public',
  server: {
    host: '0.0.0.0', // Bind to all interfaces for Docker
    port: 5173,
    watch: {
      // Use polling for Docker volume mounts (file system events may not work)
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        // Use VITE_API_URL from env file if set, otherwise default to localhost
        // In Docker, VITE_API_URL will be http://api-go:3000/api, so we extract the base URL
        // In local, it will be http://localhost:3000/api
        target: env.VITE_API_URL && env.VITE_API_URL.includes('/api')
          ? env.VITE_API_URL.replace('/api', '')
          : 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

