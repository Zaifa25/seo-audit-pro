import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

// Vite config for building the Chrome Extension popup (Manifest V3).
// The popup is a normal React SPA; background & content scripts are
// plain ES modules copied as-is (no bundling needed, kept dependency-free
// so they run directly as Chrome MV3 service worker / content script).
export default defineConfig({
  server: {
    open: '/popup.html'
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/manifest.json', dest: '.' },
        { src: 'public/icons', dest: '.' },
        { src: 'src/background/background.js', dest: 'background' },
        { src: 'src/content/content.js', dest: 'content' }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html')
      }
    }
  }
});
