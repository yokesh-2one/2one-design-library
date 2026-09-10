/*
  Scan-behaviour tests for `2one check` — the parts the single-file eval harness
  can't cover: what gets scanned by DEFAULT, what's ignored, and that an empty scan
  fails loudly instead of reporting a false "audit passed". Builds throwaway
  fixtures under the OS temp dir, including a simulated consumer install (2one under
  node_modules, no dls.config.json). Run: npm run check:scan
*/
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..')
const findings = (r) => { try { return JSON.parse(r.stdout).findings || [] } catch { return null } }
const scanned = (r) => { try { return JSON.parse(r.stdout).scanned } catch { return null } }
const fails = []
const t = (name, ok) => { if (!ok) fails.push(name) }

const root = mkdtempSync(join(tmpdir(), '2one-scan-'))
try {
  mkdirSync(join(root, 'src'), { recursive: true })
  mkdirSync(join(root, 'dist'), { recursive: true })
  mkdirSync(join(root, 'node_modules'), { recursive: true })
  mkdirSync(join(root, 'empty'), { recursive: true })
  // one real source violation, plus decoys in build/dep output
  writeFileSync(join(root, 'src/App.tsx'), 'export function App(){ return <div className="bg-blue-500"/> }\n')
  writeFileSync(join(root, 'dist/bundle.js'), 'const x="#ff0000"\n')
  writeFileSync(join(root, 'node_modules/junk.js'), 'const y="#00ff00"\n')

  // simulate an install: the engine (scripts + config) under node_modules, but NOT its src
  const pkg = join(root, 'node_modules/@2one/design-library')
  mkdirSync(pkg, { recursive: true })
  cpSync(here, join(pkg, 'scripts'), { recursive: true })
  cpSync(join(repo, 'dls.config.json'), join(pkg, 'dls.config.json'))
  const installed = join(pkg, 'scripts/check-usage.mjs')

  const run = (chk, args, cwd) => spawnSync(process.execPath, [chk, ...args], { cwd, encoding: 'utf8' })
  const CHK = join(here, 'check-usage.mjs')

  // 1. BARE check in a consumer scans its own src, never the installed package.
  const bare = run(installed, ['--json'], root)
  const bf = findings(bare)
  t('bare check finds the consumer src violation', !!bf && bf.some((f) => f.rule === 'foreign-palette'))
  t('bare check scans only the consumer src (1 file, not the package)', scanned(bare) === 1)

  // 2. dist + node_modules are ignored on `check .`
  const dot = run(CHK, ['.', '--json'], root)
  t('check . ignores dist/node_modules decoys', !!findings(dot) && findings(dot).every((f) => !/bundle|junk/.test(f.file || '')))

  // 3. `check .` and `check src` agree (dist excluded, so same source findings)
  const src = run(CHK, ['src', '--json'], root)
  const rules = (r) => (findings(r) || []).map((f) => f.rule).sort().join(',')
  t('check . == check src', rules(dot) === rules(src))

  // 4. zero scannable files → non-zero exit + a clear message, not a silent pass
  const empty = run(CHK, ['empty'], root)
  t('empty scan exits non-zero', empty.status !== 0)
  t('empty scan says "no scannable files"', /no scannable files/.test(empty.stdout + empty.stderr))
} finally {
  rmSync(root, { recursive: true, force: true })
}

if (fails.length) {
  console.error('\n  ✗ check:scan — scan behaviour regressed:\n' + fails.map((f) => `    • ${f}`).join('\n') + '\n')
  process.exit(1)
}
console.log('  ✓ check:scan — consumer default target, ignore dirs, check .==src, and empty-scan error all hold.')
