import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
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
