import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const origin = fileURLToPath(new URL('./origin', import.meta.url))
const repo = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: origin,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 4181,
    strictPort: true,
    fs: { allow: [repo] },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist-origin', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./origin/index.html', import.meta.url)),
        product: fileURLToPath(new URL('./origin/product.html', import.meta.url)),
        graph: fileURLToPath(new URL('./origin/graph.html', import.meta.url)),
        pricing: fileURLToPath(new URL('./origin/pricing.html', import.meta.url)),
        about: fileURLToPath(new URL('./origin/about.html', import.meta.url)),
        contact: fileURLToPath(new URL('./origin/contact.html', import.meta.url)),
        scores: fileURLToPath(new URL('./origin/metrics.html', import.meta.url)),
        studio: fileURLToPath(new URL('./origin/studio.html', import.meta.url)),
      },
    },
  },
})
