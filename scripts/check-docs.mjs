/*
  check:docs — keep consumer-facing docs honest against the real config
  (rule 15: generate it or check it). Both guards come from a field report of
  someone building a real app on the library.

  P3 — an instructional doc imported `@yokesh-2one/design-library` while the
       package is `@2one/design-library`, so the documented example would FAIL
       `npx 2one check` (the unknown-import rule keys off the configured name).
       Any look-alike specifier — `@<other-scope>/<the package's unscoped name>`
       — in a tracked `.md` now fails the build. CHANGELOG is exempt: it records
       the historical rename and must be free to name the old scope.

  P4 — the "Compatibility (tested)" matrix in docs/consuming.md must match the
       real toolchain majors in package.json, so the versions promised to a
       consumer can't drift from what the library actually builds against.

  Run: npm run check:docs
*/
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { config as cfg, CONFIG_FILE } from './lib/config.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
let packageName = pkg.name
try { packageName = JSON.parse(readFileSync(join(root, CONFIG_FILE), 'utf8')).packageName || packageName } catch { /* config optional */ }
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const errors = []

// ---- P3: look-alike import specifiers in tracked docs ----
const scoped = packageName.match(/^@([\w.-]+)\/(.+)$/)
if (scoped) {
  const [, scope, unscoped] = scoped
  const lookalike = new RegExp(`@([\\w.-]+)/${esc(unscoped)}\\b`, 'g')
  const docs = execSync('git ls-files "*.md"', { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean).filter((f) => !/(^|\/)CHANGELOG\.md$/i.test(f))
  for (const f of docs) {
    readFileSync(join(root, f), 'utf8').split('\n').forEach((line, i) => {
      for (const m of line.matchAll(lookalike)) {
        if (m[1] !== scope)
          errors.push(`${f}:${i + 1}: refers to "@${m[1]}/${unscoped}" but the package is "${packageName}". A consumer copying this would fail \`npx 2one check\` (unknown-import). Use ${packageName}.`)
      }
    })
  }
}

// ---- P4: the compatibility matrix must match package.json ----
const consumingRel = cfg.rel('docs.consuming')
const consuming = join(root, consumingRel)
if (existsSync(consuming)) {
  const text = readFileSync(consuming, 'utf8')
  const allDeps = { ...(pkg.peerDependencies || {}), ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const majorOf = (spec) => (spec ? Number(String(spec).replace(/^[^\d]*/, '').split('.')[0]) : null)
  // doc table label -> package.json dependency name
  const TOOLS = { React: 'react', Vite: 'vite', 'Tailwind CSS': 'tailwindcss', TypeScript: 'typescript' }
  let rows = 0
  for (const [label, dep] of Object.entries(TOOLS)) {
    const m = new RegExp(`^\\|\\s*${esc(label)}\\s*\\|\\s*(\\d+)`, 'm').exec(text)
    if (!m) continue
    rows++
    const docMajor = Number(m[1])
    const realMajor = majorOf(allDeps[dep])
    if (realMajor && docMajor !== realMajor)
      errors.push(`${consumingRel}: compatibility matrix says ${label} ${docMajor}, but package.json has ${dep}@${allDeps[dep]} (major ${realMajor}). Update the matrix.`)
  }
  if (rows === 0) errors.push(`${consumingRel}: no "Compatibility (tested)" matrix rows found to check (React/Vite/Tailwind CSS/TypeScript).`)
}

if (errors.length) {
  console.error('\n  ✗ check:docs — consumer docs disagree with the config:\n')
  for (const e of errors) console.error(`    • ${e}`)
  console.error('')
  process.exit(1)
}
console.log(`  ✓ check:docs — doc imports all use ${packageName}; consuming.md compatibility matrix matches package.json.`)
