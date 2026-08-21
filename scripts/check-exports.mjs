/*
  Barrel-completeness guard. The public API (src/index.ts) is hand-maintained,
  so it's easy to add a component under src/components/ui/ and forget to export
  it. This asserts every ui primitive + 2one-only component is re-exported.

  Run: npm run check:exports   (exits 1 on any missing export)
*/
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

const root = cfg.root
const barrel = readFileSync(join(root, 'src/index.ts'), 'utf8')

const tsx = (rel) =>
  readdirSync(join(root, rel))
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
    .map((f) => f.replace(/\.tsx$/, ''))

// files that are internal helpers, not standalone components to export
const IGNORE = new Set(['use-mobile'])

const expected = [
  ...tsx('src/components/ui').map((n) => `./components/ui/${n}`),
  ...tsx('src/components').map((n) => `./components/${n}`),
].filter((p) => !IGNORE.has(p.split('/').pop()))

const missing = expected.filter((p) => !barrel.includes(`'${p}'`) && !barrel.includes(`"${p}"`))

if (missing.length) {
  console.error(`✗ src/index.ts is missing ${missing.length} export(s):`)
  for (const m of missing) console.error(`    export * from '${m}'`)
  process.exit(1)
}
console.log(`✓ src/index.ts exports all ${expected.length} components`)
