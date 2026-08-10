import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { isAbsolute } from 'node:path'

/*
  Library build for @yokesh-2one/design-library (2one DLS).

  Entry is src/index.ts. React and every third-party dependency (Radix, lucide,
  cva, tailwind-merge, recharts, …) are left EXTERNAL — consumers install them.
  Modules are preserved so consumers only pull what they import. Tailwind is NOT
  run here: components ship as class strings the CONSUMER's Tailwind v4 compiles;
  the theme + tokens ship separately as CSS (see scripts/copy-styles.mjs).
*/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    lib: { entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
    rollupOptions: {
      // externalize anything that isn't our own source (relative, aliased, or absolute)
      external: (id) => !id.startsWith('.') && !id.startsWith('@/') && !isAbsolute(id),
      output: [
        {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
        {
          format: 'cjs',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
    },
  },
})
