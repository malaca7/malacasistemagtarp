import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // Caminho relativo para funcionar tanto com domínio customizado quanto com GitHub Pages
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
