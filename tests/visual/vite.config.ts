import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

/*
  Test-only Vite config. Serves the visual/a11y harness (tests/visual/harness),
  NOT the dev/ showcase. Separate from both the library build and the deploy build,
  so nothing here ships to consumers or to the live site. The harness mounts one
  DLS component/pattern in isolation, driven by URL params (?case=&theme=).
*/
export default defineConfig({
  root: fileURLToPath(new URL('./harness', import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 4188,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
})
