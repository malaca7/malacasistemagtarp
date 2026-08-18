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
        cidades: resolve(__dirname, 'cidades/index.html'),
        sistemas: resolve(__dirname, 'sistemas/index.html'),
        plataforma_index: resolve(__dirname, 'plataforma/index.html'),
        plataforma_fallback: resolve(__dirname, 'plataforma.html'),
        cidade_fallback: resolve(__dirname, 'cidade.html'),
        cda_city: resolve(__dirname, 'cidades/cda/index.html'),
        cda_mapa: resolve(__dirname, 'cidades/cda/mapa/index.html'),
        cda_lockpick: resolve(__dirname, 'cidades/cda/lockpick/index.html'),
        cda_caixinha: resolve(__dirname, 'cidades/cda/caixinha/index.html'),
        cda_hacking: resolve(__dirname, 'cidades/cda/hacking/index.html'),
        valley_city: resolve(__dirname, 'cidades/valley/index.html'),
        valley_mapa: resolve(__dirname, 'cidades/valley/mapa/index.html'),
        valley_lockpick: resolve(__dirname, 'cidades/valley/lockpick/index.html'),
        valley_caixinha: resolve(__dirname, 'cidades/valley/caixinha/index.html'),
        valley_hacking: resolve(__dirname, 'cidades/valley/hacking/index.html'),
        los_santos_city: resolve(__dirname, 'cidades/los-santos/index.html'),
        los_santos_mapa: resolve(__dirname, 'cidades/los-santos/mapa/index.html'),
        los_santos_lockpick: resolve(__dirname, 'cidades/los-santos/lockpick/index.html'),
        los_santos_caixinha: resolve(__dirname, 'cidades/los-santos/caixinha/index.html'),
        los_santos_hacking: resolve(__dirname, 'cidades/los-santos/hacking/index.html'),
        mapa: resolve(__dirname, 'mapa-interativo/index.html'),
        lockpick: resolve(__dirname, 'lockpick/index.html'),
        caixinha: resolve(__dirname, 'caixinha/index.html'),
        hacking: resolve(__dirname, 'hacking/index.html')
      }
    }
  }
});
