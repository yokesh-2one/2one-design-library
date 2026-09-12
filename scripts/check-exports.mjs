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
const barrel = readFileSync(join(root, cfg.rel('barrel')), 'utf8')

const tsx = (rel) =>
  readdirSync(join(root, rel))
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
    .map((f) => f.replace(/\.tsx$/, ''))

// files that are internal helpers, not standalone components to export
const IGNORE = new Set(['use-mobile'])

const expected = [
  ...tsx(cfg.rel('components')).map((n) => `./components/ui/${n}`),
  ...tsx(cfg.rel('ownComponents')).map((n) => `./components/${n}`),
].filter((p) => !IGNORE.has(p.split('/').pop()))

const missing = expected.filter((p) => !barrel.includes(`'${p}'`) && !barrel.includes(`"${p}"`))

const errors = missing.map((m) => `${cfg.rel('barrel')} is missing export: export * from '${m}'`)

// Keep docs/consuming.md in lockstep with the public package surface: if the package
// name or the styles subpath changes, the consuming guide must not silently diverge.
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
let consuming = ''
try {
  consuming = readFileSync(join(root, cfg.rel('docs.consuming')), 'utf8')
} catch {
  errors.push(`${cfg.rel('docs.consuming')} is missing (the documented consumption path).`)
}
if (consuming) {
  if (!consuming.includes(pkg.name)) {
    errors.push(`${cfg.rel('docs.consuming')} never mentions the package name "${pkg.name}".`)
  }
  const stylesSubpath = `${pkg.name}/styles`
  if (pkg.exports?.['./styles'] && !consuming.includes(stylesSubpath)) {
    errors.push(`${cfg.rel('docs.consuming')} must show the '${stylesSubpath}' import (package exports './styles').`)
  }
}

if (errors.length) {
  console.error(`✗ check:exports — ${errors.length} problem(s):`)
  for (const e of errors) console.error(`    ${e}`)
  process.exit(1)
}
console.log(`✓ src/index.ts exports all ${expected.length} components; docs/consuming.md in sync with the package surface`)
