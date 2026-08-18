import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        mapa: fileURLToPath(new URL("./mapa-interativo/index.html", import.meta.url)),
        lockpick: fileURLToPath(new URL("./lockpick/index.html", import.meta.url)),
        caixinha: fileURLToPath(new URL("./caixinha/index.html", import.meta.url)),
        hacking: fileURLToPath(new URL("./hacking/index.html", import.meta.url)),
      },
    },
  },
})
