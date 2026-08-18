import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cidade: resolve(__dirname, 'cidade/index.html'),
        cidade_fallback: resolve(__dirname, 'cidade.html'),
        mapa: resolve(__dirname, 'mapa-interativo/index.html'),
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
