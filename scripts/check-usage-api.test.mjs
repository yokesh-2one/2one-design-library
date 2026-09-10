/*
  Contract tests for the LIBRARY entry point of `check-usage`.

  The engine was CLI-only: every script ran its work at import time, printed, and
  called process.exit. An embedder (an MCP server, another checker, a test) could
  only spawn a process and parse stdout. `checkUsage()` exists so that stops being
  true, and these tests pin the two properties that make it worth having:

    1. importing the module runs NOTHING and prints NOTHING
    2. failures come back as data, so three calls including two bad ones leave
       the host process alive

  Property 1 is the fragile one. It breaks the moment someone moves work back to
  module scope, and it breaks silently, because the CLI keeps passing. It is
  checked in a CHILD process that imports the module and reports what it saw, so
  a stray console.log or process.exit is caught rather than inherited.

  Run: npm run check:api
*/
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const MOD = pathToFileURL(join(here, 'check-usage.mjs')).href

const fails = []
const t = (name, ok) => { if (!ok) fails.push(name) }

const { checkUsage, ruleset } = await import(MOD)

const root = mkdtempSync(join(tmpdir(), '2one-api-'))
try {
  mkdirSync(join(root, 'src'), { recursive: true })
  mkdirSync(join(root, 'nocode'), { recursive: true })
  writeFileSync(join(root, 'nocode/notes.txt'), 'not source\n')
  // A control that defines no interaction states: one unambiguous error.
  writeFileSync(
    join(root, 'src/Thing.tsx'),
    'export const Thing = ({ go }: { go: () => void }) => <div onClick={() => go()} className="rounded-md">x</div>\n',
  )

  // ---- it returns findings instead of printing them ----
  const r = checkUsage({ targets: [join(root, 'src')] })
  t('ok on a good target', r.ok === true && r.error === null)
  t('reports what it scanned', r.scanned === 1)
  t('finds the violation', r.errors.length >= 1)
  t('findings carry the authored rule id', r.errors.every((f) => 'enforces' in f && 'severity' in f && 'why' in f))
  t('errors and warnings partition findings', r.errors.length + r.warnings.length === r.findings.length)

  // ---- failures are data, not exits ----
  const missing = checkUsage({ targets: [join(root, 'no-such-dir')] })
  t('missing path is not ok', missing.ok === false)
  t('missing path is typed ENOENT', missing.error?.code === 'ENOENT')
  t('failed result still carries coverage', 'coverage' in missing && 'scannedLabel' in missing)

  const empty = checkUsage({ targets: [join(root, 'nocode')] })
  t('no scannable files is not ok', empty.ok === false)
  t('no scannable files is typed EMPTY', empty.error?.code === 'EMPTY')

  // Reaching here at all is the point: two failures did not kill this process.
  t('survives failures', true)

  // ---- caller-supplied ignores are honoured, not read from our argv ----
  const ignored = checkUsage({ targets: [join(root, 'src')], ignore: ['*.tsx'] })
  t('ignore globs come from the caller', ignored.ok === false && ignored.error.code === 'EMPTY')

  // ---- the rule set is readable without scanning anything ----
  t('ruleset names the payload', typeof ruleset.payload === 'string' && ruleset.payload.length > 0)
  t('ruleset lists detectors', Array.isArray(ruleset.checked) && ruleset.checked.length > 0)

  // ---- importing the module must be inert ----
  const probe = `
    const before = process.argv.slice()
    const mod = await import(${JSON.stringify(MOD)})
    console.error(JSON.stringify({
      exports: typeof mod.checkUsage === 'function' && typeof mod.ruleset === 'object',
      argvUntouched: before.length === process.argv.length,
    }))
  `
  // stdout is the assertion: a bare import must write nothing to it.
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8', cwd: root })
  t('importing exits 0', child.status === 0)
  t('importing prints nothing to stdout', child.stdout === '')
  let probed = {}
  try { probed = JSON.parse(child.stderr.trim().split('\n').pop()) } catch { /* left empty, assertion below fails */ }
  t('importing yields the exports', probed.exports === true)
} finally {
  rmSync(root, { recursive: true, force: true })
}

if (fails.length) {
  console.error(`\n  ✗ check:api — ${fails.length} contract(s) broken:\n`)
  for (const f of fails) console.error(`    · ${f}`)
  console.error('\n  The library entry point is what an embedder depends on. If work moved back')
  console.error('  to module scope, importing stopped being free and the CLI would not show it.\n')
  process.exit(1)
}
console.log('\n  ✓ check:api — checkUsage() returns data, fails without exiting, and importing it is inert\n')
