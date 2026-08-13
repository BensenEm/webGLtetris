import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so a `vite build` can be dropped onto GitHub Pages
  // (or any sub-path) without further configuration.
  base: './',
  server: {
    open: '/index.html',
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
