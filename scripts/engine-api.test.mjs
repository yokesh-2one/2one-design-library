/*
  Contract tests for the engine's LIBRARY entry points.

  The engine was CLI-only: every script ran its work at import time, printed, and
  called process.exit. An embedder (an MCP server, another checker, a test) could
  only spawn a process and parse stdout. These exports exist so that stops being
  true, and this file pins the properties that make them worth having:

    1. importing a module runs NOTHING and prints NOTHING
    2. failures come back as data, so a bad call does not kill the host process
    3. the caller's arguments decide what is inspected, not the host's argv/cwd

  Property 1 is the fragile one. It breaks the moment someone moves work back to
  module scope, and it breaks silently, because the CLI keeps passing. It is
  checked in a CHILD process that imports the module and reports what it saw, so
  a stray console.log or process.exit is caught rather than inherited.

  Covered so far: check-usage, dls-info, graph-decide. Add a section here as each further
  script gains an entry point.

  Run: npm run check:api
*/
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const CHECK = pathToFileURL(join(here, 'check-usage.mjs')).href
const INFO = pathToFileURL(join(here, 'dls-info.mjs')).href
const GRAPH = pathToFileURL(join(here, 'graph-decide.mjs')).href

const fails = []
const t = (name, ok) => { if (!ok) fails.push(name) }

const { checkUsage, ruleset } = await import(CHECK)
const { dlsInfo } = await import(INFO)
const graphApi = await import(GRAPH)

/** A bare import must be silent and must not exit. Asserted from a child. */
const importIsInert = (href, label) => {
  const probe = `
    const mod = await import(${JSON.stringify(href)})
    console.error(JSON.stringify({ keys: Object.keys(mod).length }))
  `
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8', cwd: tmpdir() })
  t(`${label}: importing exits 0`, child.status === 0)
  t(`${label}: importing prints nothing to stdout`, child.stdout === '')
  let probed = {}
  try { probed = JSON.parse(child.stderr.trim().split('\n').pop()) } catch { /* assertion below fails */ }
  t(`${label}: importing yields exports`, probed.keys > 0)
}

const root = mkdtempSync(join(tmpdir(), '2one-api-'))
try {
  mkdirSync(join(root, 'src'), { recursive: true })
  mkdirSync(join(root, 'nocode'), { recursive: true })
  writeFileSync(join(root, 'nocode/notes.txt'), 'not source\n')
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'demo', dependencies: { react: '^19.0.0' } }) + '\n')
  // A control that defines no interaction states: one unambiguous error.
  writeFileSync(
    join(root, 'src/Thing.tsx'),
    'export const Thing = ({ go }: { go: () => void }) => <div onClick={() => go()} className="rounded-md">x</div>\n',
  )

  // ---- check-usage: returns findings instead of printing them ----
  const r = checkUsage({ targets: [join(root, 'src')] })
  t('check: ok on a good target', r.ok === true && r.error === null)
  t('check: reports what it scanned', r.scanned === 1)
  t('check: finds the violation', r.errors.length >= 1)
  t('check: findings carry the authored rule id', r.errors.every((f) => 'enforces' in f && 'severity' in f && 'why' in f))
  t('check: errors and warnings partition findings', r.errors.length + r.warnings.length === r.findings.length)

  const missing = checkUsage({ targets: [join(root, 'no-such-dir')] })
  t('check: missing path is not ok', missing.ok === false)
  t('check: missing path is typed ENOENT', missing.error?.code === 'ENOENT')
  t('check: failed result still carries coverage', 'coverage' in missing && 'scannedLabel' in missing)

  const empty = checkUsage({ targets: [join(root, 'nocode')] })
  t('check: no scannable files is not ok', empty.ok === false)
  t('check: no scannable files is typed EMPTY', empty.error?.code === 'EMPTY')

  // Reaching here at all is the point: two failures did not kill this process.
  t('check: survives failures', true)

  const ignored = checkUsage({ targets: [join(root, 'src')], ignore: ['*.tsx'] })
  t('check: ignore globs come from the caller', ignored.ok === false && ignored.error.code === 'EMPTY')

  t('check: ruleset names the payload', typeof ruleset.payload === 'string' && ruleset.payload.length > 0)
  t('check: ruleset lists detectors', Array.isArray(ruleset.checked) && ruleset.checked.length > 0)

  // ---- dls-info: answers about the project it was ASKED about ----
  const mine = dlsInfo()
  const theirs = dlsInfo({ cwd: root })
  t('info: returns a report', mine && typeof mine === 'object' && 'dls' in mine && 'problems' in mine)
  t('info: cwd argument is honoured', theirs.dls.installed === false)
  t('info: does not answer about its own cwd', mine.dls.installed !== theirs.dls.installed)
  t('info: reports problems as data', Array.isArray(theirs.problems) && theirs.problems.length > 0)
  // Two different projects, one process, no chdir. The module-scope version
  // could not do this at all: it bound itself to process.cwd() on import.
  t('info: survives being called twice for different roots', mine !== theirs)

  // ---- graph-decide: answers questions instead of printing them ----
  const { decide, resolveNode, rulesFor, alternativesFor, incompatibleWith, checkPair, edgesBetween, graphSummary } = graphApi
  const intent = graphSummary.intents[0]
  t('graph: summary describes the graph', graphSummary.nodes > 0 && graphSummary.edges > 0 && graphSummary.classes.length > 0)
  t('graph: summary lists intents', Array.isArray(graphSummary.intents) && graphSummary.intents.length > 0)

  const d = decide(intent.id)
  t('graph: decide answers a real intent', d && !d.error && typeof d.decision === 'string')
  t('graph: decision carries its rules', Array.isArray(d.mandatory_rules) && Array.isArray(d.all_rules))

  // An unresolvable query is DATA, not a thrown error or an exit.
  const nonsense = decide('zzz-no-such-intent-anywhere')
  t('graph: unknown intent returns an error field', Boolean(nonsense && nonsense.error))
  t('graph: unknown intent does not throw', true)

  t('graph: resolveNode maps a label to an id', resolveNode(intent.label) === intent.id)
  t('graph: rulesFor returns a list', Array.isArray(rulesFor(intent.id)))
  t('graph: alternativesFor returns a list', Array.isArray(alternativesFor(intent.id)))
  t('graph: incompatibleWith returns a list', Array.isArray(incompatibleWith(intent.id)))

  const verdict = checkPair(intent.id, intent.id)
  t('graph: checkPair returns a known verdict', ['YES', 'NO', 'UNSPECIFIED'].includes(verdict.verdict))
  t('graph: checkPair cites its relations', Array.isArray(verdict.relations) && Array.isArray(verdict.governing_rules))
  t('graph: edgesBetween returns edges', Array.isArray(edgesBetween(intent.id, intent.id).edges))

  // ---- importing either module must be inert ----
  importIsInert(CHECK, 'check')
  importIsInert(INFO, 'info')
  importIsInert(GRAPH, 'graph')
} finally {
  rmSync(root, { recursive: true, force: true })
}

if (fails.length) {
  console.error(`\n  ✗ check:api — ${fails.length} contract(s) broken:\n`)
  for (const f of fails) console.error(`    · ${f}`)
  console.error('\n  These entry points are what an embedder depends on. If work moved back to')
  console.error('  module scope, importing stopped being free and the CLI would not show it.\n')
  process.exit(1)
}
console.log('\n  ✓ check:api — checkUsage(), dlsInfo() and the graph API return data, fail without exiting, and import inertly\n')
