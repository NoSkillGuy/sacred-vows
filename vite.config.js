import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/**/*'],
      manifest: {
        name: 'Priya & Saurabh Wedding Invitation',
        short_name: 'Priya & Saurabh Wedding Invite',
        description: 'Royal wedding invitation of Capt Dr. Priya Singh & Dr. Saurabh Singh',
        theme_color: '#d4af37',
        background_color: '#fff8f0',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'assets/photos/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'assets/photos/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['lifestyle', 'events'],
        shortcuts: [
          {
            name: 'RSVP',
            short_name: 'RSVP',
            description: 'Quick RSVP',
            url: '/#rsvp',
            icons: [{ src: 'assets/photos/icons/icon-192.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'Program',
            short_name: 'Program',
            description: 'View program details',
            url: '/#events',
            icons: [{ src: 'assets/photos/icons/icon-192.png', sizes: '96x96', type: 'image/png' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,mp3,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

