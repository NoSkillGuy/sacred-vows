import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if CDN is configured (dev/prod environments)
const isCDNConfigured = !!process.env.VITE_PUBLIC_ASSETS_CDN_URL;

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
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

