import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Serve a neutral 2one-grayscale placeholder for Astryx's demo assets
// (/template-assets/*), which live on Astryx's site and 404 here. SVG bytes with
// an image/* content-type render fine inside <img src="*.png">.
const placeholderAssets = (): Plugin => ({
  name: 'template-assets-placeholder',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith('/template-assets/')) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#e5e5e5"/><g fill="#a3a3a3"><circle cx="185" cy="150" r="30"/><path d="M120 280 l70-84 52 52 44-44 74 76z"/></g><rect x="1" y="1" width="478" height="358" fill="none" stroke="#d4d4d4"/></svg>`
        res.setHeader('Content-Type', 'image/svg+xml')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(svg)
        return
      }
      next()
    })
  },
})

export default defineConfig(({ command }) => ({
  plugins: [react(), placeholderAssets()],
  // Static build is mounted at /astryx/ in the unified site; dev stays at root.
  base: command === 'build' ? '/astryx/' : '/',
  server: { port: 4200, strictPort: true },
  build: {
    rollupOptions: {
      input: { main: 'index.html', graph: 'graph.html' }, // catalog + knowledge-graph explorer
    },
  },
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.tsx'],
    include: ['recharts', 'lucide-react', '@heroicons/react/24/outline', '@heroicons/react/24/solid', '@heroicons/react/20/solid'],
  },
}))
