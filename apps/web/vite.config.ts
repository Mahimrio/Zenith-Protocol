/**
 * @file vite.config.ts
 * @description Vite configuration for the Host App.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
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
    dedupe: ['react', 'react-dom', 'three', 'gsap', 'zustand'],
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
