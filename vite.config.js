import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/', // Permite navegação pelas páginas (.html) tanto no servidor local quanto em produção
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lockpick: resolve(__dirname, 'lockpick.html'),
        caixinha: resolve(__dirname, 'caixinha.html'),
        hacking: resolve(__dirname, 'hacking.html')
      }
    }
  }
});
