import { defineConfig } from 'vite';

export default defineConfig({
  base: '/malacasistemagtarp/', // Caminho base necessário para o deploy no GitHub Pages
  build: {
    outDir: 'dist',
  }
});
