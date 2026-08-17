import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lockpick: resolve(__dirname, 'lockpick/index.html'),
        caixinha: resolve(__dirname, 'caixinha/index.html'),
        hacking: resolve(__dirname, 'hacking/index.html'),
        lockpick_fallback: resolve(__dirname, 'lockpick.html'),
        caixinha_fallback: resolve(__dirname, 'caixinha.html'),
        hacking_fallback: resolve(__dirname, 'hacking.html')
      }
    }
  }
});
