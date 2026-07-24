import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/malacasistemagtarp/', // Caminho base necessário para o deploy no GitHub Pages
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
