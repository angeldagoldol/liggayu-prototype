import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps every asset URL relative, so the built `dist/` folder
// works from any host or sub-path (Vercel, Netlify, GitHub Pages, a USB stick).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Fold tiny shared chunks (a single lucide icon, Chip, Switch…) into
        // their importers instead of shipping a dozen sub-kilobyte requests.
        experimentalMinChunkSize: 8_000,
        // Shared chunks are otherwise named after whichever module Rollup
        // picks first; give the cover-art chunk a recognisable name.
        chunkFileNames(chunk) {
          const coverArt = chunk.moduleIds.some((id) => /[\\/]components[\\/]brochure[\\/]CoverArt\.jsx$/.test(id));
          return coverArt && !chunk.isDynamicEntry ? 'assets/cover-art-[hash].js' : 'assets/[name]-[hash].js';
        },
        // Two long-lived vendor chunks that change far less often than app
        // code. A function (not the object form) so sub-paths such as
        // react-dom/client and framer-motion's motion-dom land here too.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)[\\/]/.test(id)) {
            return 'react';
          }
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
