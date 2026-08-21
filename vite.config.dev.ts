import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// Dev-only config: serves the /dev sampler so the 2one-themed shadcn
// components can be verified in a browser. Separate from the library build.
export default defineConfig({
  root: fileURLToPath(new URL('./dev', import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 4180,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] },
  },
  // Static build of the showcase site (catalog + knowledge graph) for Vercel.
  build: {
    outDir: fileURLToPath(new URL('./dist-site', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./dev/index.html', import.meta.url)),
        graph: fileURLToPath(new URL('./dev/graph.html', import.meta.url)),
        dls: fileURLToPath(new URL('./dev/dls.html', import.meta.url)),
      },
    },
  },
})
