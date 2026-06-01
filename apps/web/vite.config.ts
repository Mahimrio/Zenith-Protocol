/**
 * @file vite.config.ts
 * @description Vite configuration for the Host App.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Zenith Protocol',
        short_name: 'Zenith',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /\/sounds\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sounds-cache',
              expiration: { maxEntries: 50 },
            },
          },
          {
            urlPattern: /\/api\/leaderboards/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@sdk': path.resolve(__dirname, '../../packages/game-sdk/src'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@games': path.resolve(__dirname, '../../games'),
    },
    dedupe: ['react', 'react-dom', 'three', 'gsap', 'zustand', '@react-three/fiber', '@react-three/drei', '@react-three/rapier', '@react-three/postprocessing'],
    preserveSymlinks: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('games/dojo-3d')) return 'game-dojo-3d';
          if (id.includes('games/card-battler')) return 'game-card-battler';
          if (id.includes('games/cyber-runner')) return 'game-cyber-runner';
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/react')) return 'vendor-react';
        }
      }
    }
  }
});
