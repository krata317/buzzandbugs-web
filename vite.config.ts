import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The backend allowlists http://localhost:3000 for CORS and for the Origin check on
// unsafe methods, so the dev server must stay on that port.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
