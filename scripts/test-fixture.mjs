/*
  Runs the engine against fixtures/acme and asserts payload isolation.

  The engine was written inside 2one, so every 2one-shaped assumption it holds is
  invisible from there — a run against 2one succeeds whether the assumption is
  present or not. This is the only check that can tell the difference.

  It asserts two things:
    1. Acme's output contains ACME's values (the engine read the right payload)
    2. Acme's output contains NONE of 2one's (nothing leaked through)

  The second is what catches the silent failures. Three of the four bugs found
  when this fixture was first built reported success while producing nothing, or
  producing 2one's data under Acme's name.

  Temporary — moves with the engine when it leaves this repo.
  Run: npm run test:fixture
*/
import { readFileSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const engineRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const fixture = join(engineRoot, 'fixtures/acme')

if (!existsSync(fixture)) {
  console.error(`\n  fixtures/acme is missing — nothing to test against.\n`)
  process.exit(1)
}

// Start from a clean slate so a stale artefact cannot make a broken run pass.
for (const p of ['design/out', 'acme-manifest.json', 'acme-graph.json']) {
  rmSync(join(fixture, p), { recursive: true, force: true })
}
mkdirSync(join(fixture, 'design/out'), { recursive: true })

const run = (script) => {
  const r = spawnSync(process.execPath, [join(engineRoot, 'scripts', script)], { cwd: fixture, encoding: 'utf8' })
  if (r.status !== 0) {
    console.error(`\n  ${script} failed against the fixture:\n${r.stderr || r.stdout}`)
    process.exit(1)
  }
  return r.stdout
}

run('build-tokens.mjs')
run('build-manifest.mjs')

const read = (p) => {
  const f = join(fixture, p)
  if (!existsSync(f)) {
    console.error(`\n  the engine reported success but did not write ${p}.`)
    console.error('  A generator that writes nothing looks identical to one that writes the same thing.\n')
    process.exit(1)
  }
  return JSON.parse(readFileSync(f, 'utf8'))
}

const colors = read('design/out/colors.json')
const manifest = read('acme-manifest.json')

const failures = []
const expect = (label, cond, detail) => { if (!cond) failures.push(`${label} — ${detail}`) }

// 1. Did the engine actually read Acme?
expect('acme palette', colors.semantic.primary === '#0f172a', `semantic.primary is ${colors.semantic.primary}, expected #0f172a`)
expect('acme ramps', Object.keys(colors.ramps).join(',') === 'slate,alert,ok', `ramps are ${Object.keys(colors.ramps).join(',')}, expected slate,alert,ok`)
expect('acme ramp values', Object.keys(colors.ramps.slate ?? {}).length === 3, 'slate ramp is empty — the palette was discarded')
expect('acme components', manifest.index.components.count === 3, `counted ${manifest.index.components.count} components, expected 3`)
expect('acme naming', manifest.kind.startsWith('Acme'), `manifest.kind is "${manifest.kind}"`)
expect('acme logo url', /acme\/design-system/.test(JSON.stringify(manifest.index.brand.logo)), 'logo URLs do not point at the acme repo')

// 2. Did anything from 2one leak through?
const blob = JSON.stringify({ colors, manifest })
// Word-boundaried: a bare /Inter/i also matches "interchange", which is a
// legitimate word in the DTCG description and not a leak.
for (const leak of ['Satoshi', 'Inter', 'shadcn', 'lucide', '2one', 'pill']) {
  expect('no 2one leak', !new RegExp(`\\b${leak}\\b`, 'i').test(blob), `"${leak}" appears in Acme's generated output`)
}
for (const hex of ['#09090b', '#dcdce0', '#c81e1e']) {
  expect('no 2one colour', !blob.includes(hex), `${hex} (a 2one token) appears in Acme's output`)
}

// 3. Do the audit rules enforce ACME's policy, not 2one's?
//    This is the sharpest check available: the same rule engine must reach the
//    OPPOSITE verdict on lucide for the two payloads. 2one sanctions it; Acme
//    sanctions phosphor. If the rules were still hardcoded, lucide would pass
//    here and Acme's own `slate` ramp would be reported as a foreign hue.
const audit = spawnSync(
  process.execPath,
  [join(engineRoot, 'scripts/check-usage.mjs'), 'ui/templates/bad.tsx', '--json'],
  { cwd: fixture, encoding: 'utf8' }
)
try {
  const rules = JSON.parse(audit.stdout).findings.map((f) => `${f.rule}:${f.detail}`)
  const has = (r, d) => rules.some((x) => x.startsWith(`${r}:`) && x.includes(d))
  expect('acme icon policy', has('foreign-icons', 'lucide'), 'lucide-react not flagged — Acme sanctions phosphor, so the rule is still using 2one\'s library')
  expect('acme own ramps allowed', !rules.some((r) => r.includes('bg-slate-500')), 'Acme\'s own `slate` ramp was reported as a foreign hue')
  expect('acme own ramps allowed', !rules.some((r) => r.includes('text-alert-600')), 'Acme\'s own `alert` ramp was reported as a foreign hue')
  expect('acme wordmark', has('typeset-wordmark', 'acme'), 'the wordmark rule did not fire for "acme" — it is still looking for "2one"')
  expect('foreign hue still caught', has('foreign-palette', 'bg-blue-600'), 'bg-blue-600 was not flagged')
} catch (e) {
  failures.push(`audit rules — could not parse check-usage output: ${e.message}`)
}

// 4. Opt-in outputs must stay opt-in.
expect('no unrequested files', !existsSync(join(fixture, 'integrations')), 'a Canva export was written for a payload that never configured one')

if (failures.length) {
  console.error(`\n  fixture: ${failures.length} assertion(s) failed\n`)
  for (const f of failures) console.error(`    ✗ ${f}`)
  console.error('')
  process.exit(1)
}

console.log(`\n  ✓ engine ran against a second payload — Acme's values present, none of 2one's\n`)
