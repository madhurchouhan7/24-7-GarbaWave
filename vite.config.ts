import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
  // Build both entry points
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        explore: 'explore/index.html',
      },
    },
  },
});
