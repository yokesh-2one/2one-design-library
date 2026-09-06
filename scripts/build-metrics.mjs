/*
  Product KPIs for Origin (the repo today).

  Measured: file bytes, graph:decide / what-uses JSON size, graph:test and
  (with --extensive) evals / check-usage / a11y.

  Estimated: tokens (bytes / chars_per_token), API $ (assumptions.json rate
  card), engineer hours (assumptions.json minutes). Never billed usage.

  npm run metrics              inventory + KPI model (CI-stable except live sizes)
  npm run kpis                 --extensive: also evals, a11y, check coverage, last-run.json

  When the user asks to test these KPIs: run npm run kpis and read snapshot.json.
*/
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync, execSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const extensive = process.argv.includes('--extensive')
const assumptions = JSON.parse(readFileSync(join(root, 'metrics/assumptions.json'), 'utf8'))
const protocol = JSON.parse(readFileSync(join(root, 'metrics/protocol.json'), 'utf8'))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const graph = JSON.parse(readFileSync(join(root, 'graph.json'), 'utf8'))
const rules = JSON.parse(readFileSync(join(root, 'rules/ux-rules.json'), 'utf8'))

const CPT = assumptions.chars_per_token
const USD_MTOK = assumptions.model.usd_per_million_input_tokens

function ls(dir, pred) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(pred).sort()
}

function bytesOf(rel) {
  const p = join(root, rel)
  return existsSync(p) ? statSync(p).size : 0
}

function walkBytes(rel, { ext = null, skip = [] } = {}) {
  const base = join(root, rel)
  if (!existsSync(base)) return 0
  const skipSet = new Set(skip)
  let total = 0
  const walk = (p) => {
    for (const name of readdirSync(p)) {
      if (skipSet.has(name)) continue
      if (name === 'node_modules' || name === '.git' || name === 'dist' || name === 'dist-origin' || name === 'dist-site') continue
      const fp = join(p, name)
      const st = statSync(fp)
      if (st.isDirectory()) walk(fp)
      else if (!ext || ext.test(name)) total += st.size
    }
  }
  walk(base)
  return total
}

function tokensOfBytes(n) {
  return Math.round(n / CPT)
}

function usdOfTokens(tok) {
  return Math.round((tok / 1_000_000) * USD_MTOK * 10000) / 10000
}

function score(partial) {
  return {
    unit: 'count',
    kind: 'measured',
    surfaces: ['ask'],
    category: 'inventory',
    product_use: '',
    method: '',
    ...partial,
  }
}

function runNode(script, args = [], timeout = 120000) {
  const t0 = performance.now()
  const r = spawnSync(process.execPath, [join(root, script), ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout,
    maxBuffer: 20 * 1024 * 1024,
  })
  return {
    ms: Math.round(performance.now() - t0),
    status: r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    error: r.error ? String(r.error.message) : '',
  }
}

const DECIDE_QUERIES = [
  ['decide', 'primary-action'],
  ['decide', 'app shell'],
  ['decide', 'show profile'],
  ['decide', 'submit-form'],
  ['decide', 'destructive-action'],
  ['decide', 'confirm-action'],
  ['decide', 'supplementary-info'],
  ['check', 'component:tooltip', 'essential-instruction'],
  ['rules', 'component:button'],
  ['alternatives', 'component:dialog'],
]

const WHAT_USES_QUERIES = ['Button', 'token:primary', 'component:card']

const PACK = [
  'manifest.json',
  'llms.txt',
  'AGENTS.md',
  'brand/brand.json',
  'rules/ux-rules.json',
  'dls.config.json',
  'skills/2one-dls/SKILL.md',
  ...ls(join(root, 'tokens'), (f) => f.endsWith('.json')).map((f) => `tokens/${f}`),
]

const ui = ls(join(root, 'src/components/ui'), (f) => f.endsWith('.tsx'))
const authored = ls(join(root, 'src/components'), (f) => f.endsWith('.tsx'))
const charts = ls(join(root, 'src/blocks/charts'), (f) => f.endsWith('.tsx'))
const marketing = ls(join(root, 'src/blocks/marketing'), (f) => f.endsWith('.tsx'))
const patterns = ls(join(root, 'src/patterns'), (f) => f.endsWith('.tsx'))

const graphBytes = bytesOf('graph.json')
const packBytes = PACK.reduce((n, f) => n + bytesOf(f), 0)
const srcTsxBytes = walkBytes('src', { ext: /\.tsx$/ })
let trackedBytes = 0
try {
  const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
  trackedBytes = files.reduce((n, f) => n + bytesOf(f), 0)
} catch {
  trackedBytes = 0
}

const decideRuns = DECIDE_QUERIES.map((args) => {
  const r = runNode('scripts/graph-decide.mjs', [...args, '--json'])
  const out = r.stdout.trim()
  return { args, ...r, bytes: Buffer.byteLength(out, 'utf8') }
})
const whatRuns = WHAT_USES_QUERIES.map((q) => {
  const r = runNode('scripts/what-uses.mjs', [q, '--json'])
  return { q, ...r, bytes: Buffer.byteLength((r.stdout || '').trim(), 'utf8') }
})

const queryBytes =
  decideRuns.reduce((n, r) => n + r.bytes, 0) / Math.max(decideRuns.length, 1)
const whatBytes =
  whatRuns.reduce((n, r) => n + r.bytes, 0) / Math.max(whatRuns.length, 1)
const meanQueryBytes = (queryBytes + whatBytes) / 2

const graphTok = tokensOfBytes(graphBytes)
const packTok = tokensOfBytes(packBytes)
const srcTok = tokensOfBytes(srcTsxBytes)
const trackedTok = trackedBytes ? tokensOfBytes(trackedBytes) : 0
const queryTok = tokensOfBytes(meanQueryBytes)
const tokenSavedQuery = Math.max(0, graphTok - queryTok)
const tokenSavedPack = Math.max(0, srcTok - packTok)
const tokenSavedTracked = trackedTok ? Math.max(0, trackedTok - packTok) : 0

const graphTest = runNode('scripts/graph-decision-tests.mjs')
const graphTestCases = 13
const graphTestPass = graphTest.status === 0
const graphTestPct = graphTestPass ? 100 : 0

let evalsPct = null
let evalsDetail = null
let a11yOk = null
let originCoverage = null
const traces = {
  decide: decideRuns.map(({ args, ms, status, bytes }) => ({ args, ms, status, bytes })),
  what_uses: whatRuns.map(({ q, ms, status, bytes }) => ({ q, ms, status, bytes })),
  graph_test_ms: graphTest.ms,
  graph_test_status: graphTest.status,
}

const chkFast = runNode('scripts/check-usage.mjs', ['src/components/ui/button.tsx', '--json'])
let checkablePct = null
try {
  const parsed = JSON.parse(chkFast.stdout)
  traces.check_coverage = parsed.coverage
  if (parsed.coverage?.checked && parsed.coverage?.total) {
    checkablePct = Math.round((parsed.coverage.checked / parsed.coverage.total) * 100)
  }
} catch { /* leave null */ }

if (extensive) {
  const ev = runNode('scripts/run-evals.mjs', [], 180000)
  traces.evals_ms = ev.ms
  traces.evals_status = ev.status
  const okLine = ev.stdout.match(/(\d+)\s+case/)
  const failLine = ev.stdout.match(/✗/)
  const caseFiles = ls(join(root, 'evals/cases'), (f) => f.endsWith('.tsx')).length
  evalsPct = ev.status === 0 ? 100 : 0
  evalsDetail = { cases: caseFiles, status: ev.status, ms: ev.ms, okLine, failed: Boolean(failLine) }

  const a11y = runNode('scripts/apca-audit.mjs', [], 120000)
  traces.a11y_ms = a11y.ms
  traces.a11y_status = a11y.status
  a11yOk = a11y.status === 0

  const chk = runNode('scripts/check-usage.mjs', ['origin', '--json'], 180000)
  traces.check_origin_ms = chk.ms
  traces.check_origin_status = chk.status
  try {
    const parsed = JSON.parse(chk.stdout)
    originCoverage = parsed.coverage || null
    traces.check_origin_errors = parsed.errors
    traces.check_origin_warnings = parsed.warnings
  } catch {
    originCoverage = null
  }
}

const labour = assumptions.labour
const savedMin = labour.minutes_review_without_product - labour.minutes_review_with_product
const hoursPer100 = Math.round((savedMin * assumptions.scale.cycles_for_headline) / 60 * 10) / 10
const usdLabourPer100 = Math.round(hoursPer100 * labour.usd_per_hour)
const usdQuery = usdOfTokens(tokenSavedQuery)
const usdPack = usdOfTokens(tokenSavedPack)
const usdQuery100 = Math.round(usdQuery * assumptions.scale.cycles_for_headline * 100) / 100
const usdPack100 = Math.round(usdPack * assumptions.scale.cycles_for_headline * 100) / 100

const kpis = [
  score({
    id: 'token_saved_query_vs_graph',
    label: 'Est. tokens saved: query vs dump graph.json',
    value: tokenSavedQuery,
    unit: 'est_tokens',
    kind: 'estimated',
    category: 'token',
    surfaces: ['marketing', 'ask'],
    source: 'graph.json bytes vs mean graph:decide + what-uses JSON',
    method: protocol.baselines.connected_query,
    product_use: 'Keep CLI queries. Do not paste graph.json into a chat.',
  }),
  score({
    id: 'usd_saved_query_vs_graph',
    label: 'Est. API input $ saved per graph query',
    value: usdQuery,
    unit: 'usd',
    kind: 'estimated',
    category: 'cost',
    surfaces: ['marketing', 'ask'],
    source: `${assumptions.model.id} ${USD_MTOK}/MTok input · ${assumptions.model.source}`,
    method: 'token_saved_query_vs_graph × working input rate. Output tokens not modelled.',
    product_use: 'Sales figure is estimated API input, not an Origin licence discount.',
  }),
  score({
    id: 'usd_saved_query_vs_graph_per_100',
    label: `Est. API input $ saved per ${assumptions.scale.cycles_for_headline} graph queries`,
    value: usdQuery100,
    unit: 'usd',
    kind: 'estimated',
    category: 'cost',
    surfaces: ['ask'],
    source: 'usd_saved_query_vs_graph × scale.cycles_for_headline',
    method: assumptions.scale.scale_note,
    product_use: 'Scale the per-query estimate; still not billed usage.',
  }),
  score({
    id: 'token_saved_pack_vs_src',
    label: 'Est. tokens saved: AI-legible pack vs dump src TSX',
    value: tokenSavedPack,
    unit: 'est_tokens',
    kind: 'estimated',
    category: 'token',
    surfaces: ['marketing', 'ask'],
    source: 'connected pack bytes vs src/**/*.tsx',
    method: protocol.baselines.connected_pack,
    product_use: 'Agents should start from the pack, then open one component — not the whole src tree.',
  }),
  score({
    id: 'usd_saved_pack_vs_src',
    label: 'Est. API input $ saved: pack vs dump src TSX',
    value: usdPack,
    unit: 'usd',
    kind: 'estimated',
    category: 'cost',
    surfaces: ['marketing', 'ask'],
    source: `${assumptions.model.id} ${USD_MTOK}/MTok input`,
    method: 'token_saved_pack_vs_src × working input rate.',
    product_use: 'Same caveat: estimated input, one dump avoided.',
  }),
  score({
    id: 'usd_saved_pack_vs_src_per_100',
    label: `Est. API input $ saved per ${assumptions.scale.cycles_for_headline} pack-vs-src dumps avoided`,
    value: usdPack100,
    unit: 'usd',
    kind: 'estimated',
    category: 'cost',
    surfaces: ['ask'],
    source: 'usd_saved_pack_vs_src × scale',
    method: assumptions.scale.scale_note,
    product_use: 'Internal planning only until we measure real dump frequency.',
  }),
  ...(trackedTok
    ? [
        score({
          id: 'token_saved_pack_vs_tracked',
          label: 'Est. tokens saved: pack vs all git-tracked files',
          value: tokenSavedTracked,
          unit: 'est_tokens',
          kind: 'estimated',
          category: 'token',
          surfaces: ['ask', 'internal'],
          source: 'git ls-files byte sum vs pack',
          method: protocol.baselines.dump_tracked,
          product_use: 'Upper bound. Nobody should paste the whole tree; this shows why the pack exists.',
        }),
      ]
    : []),
  score({
    id: 'graph_test_pass_pct',
    label: 'Decision tests passing',
    value: graphTestPct,
    unit: 'percent',
    kind: 'measured',
    category: 'efficiency',
    surfaces: ['marketing', 'ask'],
    source: `npm run graph:test (${graphTestCases} cases)`,
    method: 'Same intent must return the same 2one decision.',
    product_use: 'If this drops, an agent will ship a different pattern than last week.',
  }),
  score({
    id: 'checkable_rule_pct',
    label: 'UX rules that are mechanically checkable',
    value: checkablePct ?? 0,
    unit: 'percent',
    kind: checkablePct == null ? 'estimated' : 'measured',
    category: 'efficiency',
    surfaces: ['ask'],
    source: 'npx 2one check --json → coverage.checked / coverage.total',
    method: 'Efficiency of integrating: share of rules an agent can prove without a human.',
    product_use: 'Raise this to cut review load. Advisory must-rules still need eyes.',
  }),
  score({
    id: 'hours_saved_per_100_cycles',
    label: `Modelled hours saved per ${assumptions.scale.cycles_for_headline} generation cycles`,
    value: hoursPer100,
    unit: 'hours',
    kind: 'estimated',
    category: 'labour',
    surfaces: ['marketing', 'ask'],
    source: 'metrics/assumptions.json → labour',
    method: labour.cycle_note,
    product_use: 'Not a time study. Use to compare review-load bets, not to quote a customer saving.',
  }),
  score({
    id: 'usd_labour_saved_per_100_cycles',
    label: `Modelled labour $ per ${assumptions.scale.cycles_for_headline} cycles`,
    value: usdLabourPer100,
    unit: 'usd',
    kind: 'estimated',
    category: 'labour',
    surfaces: ['ask'],
    source: `hours_saved_per_100_cycles × $${labour.usd_per_hour}/h working assumption`,
    method: labour.usd_per_hour_note,
    product_use: 'Internal. Do not put this on a sales page as a guarantee.',
  }),
  score({
    id: 'context_ratio_src_to_pack',
    label: 'src TSX size / AI-legible pack size',
    value: packBytes ? Math.round((srcTsxBytes / packBytes) * 10) / 10 : 0,
    unit: 'ratio',
    kind: 'measured',
    category: 'efficiency',
    surfaces: ['ask'],
    source: 'byte ratio',
    method: 'How much smaller the connected pack is than dumping components.',
    product_use: 'If this shrinks, the pack is bloating — split it.',
  }),
]

const scores = [
  score({
    id: 'package_version',
    label: 'Package version',
    value: pkg.version,
    unit: 'semver',
    surfaces: ['ask'],
    source: 'package.json',
    product_use: 'Track unproven-in-production status (AGENTS.md).',
  }),
  score({
    id: 'components_ui',
    label: 'UI primitives (src/components/ui)',
    value: ui.length,
    surfaces: ['ask'],
    source: 'src/components/ui/*.tsx',
    product_use: 'Watch the public primitive surface.',
  }),
  score({
    id: 'components_2one',
    label: '2one-authored components',
    value: authored.length,
    surfaces: ['ask'],
    source: 'src/components/*.tsx',
    product_use: 'Components shadcn does not ship.',
  }),
  score({
    id: 'components_total',
    label: 'Components in src/components',
    value: ui.length + authored.length,
    surfaces: ['marketing', 'ask'],
    source: 'src/components/ui + src/components',
    product_use: 'Headline count; regenerate so it cannot drift.',
  }),
  score({
    id: 'themes_audited',
    label: 'Themes audited',
    value: 2,
    surfaces: ['marketing', 'ask'],
    source: 'src/styles/globals.css :root and .dark; npm run a11y',
    product_use: 'Do not list dark as a gap.',
  }),
  score({
    id: 'graph_nodes',
    label: 'Graph nodes',
    value: graph.stats.nodes,
    surfaces: ['marketing', 'ask'],
    source: 'graph.json → stats.nodes',
    product_use: 'Impact-analysis coverage.',
  }),
  score({
    id: 'graph_edges',
    label: 'Graph edges',
    value: graph.stats.edges,
    surfaces: ['marketing', 'ask'],
    source: 'graph.json → stats.edges',
    product_use: 'Impact-analysis coverage.',
  }),
  score({
    id: 'ux_rules',
    label: 'UX rules',
    value: rules.rules.length,
    surfaces: ['ask'],
    source: 'rules/ux-rules.json',
    product_use: 'Contract density; npm run check:rules.',
  }),
  score({
    id: 'charts',
    label: 'Chart blocks',
    value: charts.length,
    surfaces: ['ask'],
    source: 'src/blocks/charts/*.tsx',
    product_use: 'Template coverage.',
  }),
  score({
    id: 'marketing_block_files',
    label: 'Marketing block files',
    value: marketing.length,
    surfaces: ['ask'],
    source: 'src/blocks/marketing/*.tsx',
    product_use: 'Website-kit completeness.',
  }),
  score({
    id: 'patterns',
    label: 'Page patterns in src/patterns',
    value: patterns.length,
    surfaces: ['ask'],
    source: 'src/patterns/*.tsx',
    product_use: 'Track marketing-site vs app-shell coverage.',
  }),
  score({
    id: 'graph_json_bytes',
    label: 'graph.json size',
    value: graphBytes,
    unit: 'bytes',
    surfaces: ['ask', 'internal'],
    source: 'stat graph.json',
    product_use: 'Baseline for the dump-graph KPI.',
  }),
  score({
    id: 'pack_bytes',
    label: 'AI-legible pack size',
    value: packBytes,
    unit: 'bytes',
    surfaces: ['ask', 'internal'],
    source: PACK.join(', '),
    product_use: 'Connected-repo context.',
  }),
  score({
    id: 'src_tsx_bytes',
    label: 'src/**/*.tsx size',
    value: srcTsxBytes,
    unit: 'bytes',
    surfaces: ['ask', 'internal'],
    source: 'walk src',
    product_use: 'Dump-src baseline.',
  }),
  score({
    id: 'public_npm',
    label: 'On a public npm registry',
    value: false,
    unit: 'boolean',
    surfaces: ['ask'],
    source: 'docs/consuming.md · AGENTS.md',
    product_use: 'Install-path gap.',
  }),
  score({
    id: 'product_test_suite',
    label: 'vitest/Playwright as the product suite',
    value: false,
    unit: 'boolean',
    surfaces: ['ask'],
    source: 'AGENTS.md',
    product_use: 'CI is static; do not claim rendered-test coverage.',
  }),
]

const snapshot = {
  est_chars_per_token: CPT,
  assumptions: {
    retrieved: assumptions.retrieved,
    model: assumptions.model.id,
    usd_per_million_input_tokens: USD_MTOK,
    source: assumptions.model.source,
    labour_usd_per_hour: labour.usd_per_hour,
    minutes_without: labour.minutes_review_without_product,
    minutes_with: labour.minutes_review_with_product,
  },
  kpis,
  scores,
}

writeFileSync(join(root, 'metrics/snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`)

if (extensive) {
  writeFileSync(
    join(root, 'metrics/last-run.json'),
    `${JSON.stringify(
      {
        extensive: true,
        pack: PACK,
        evals: { ...evalsDetail, pass_pct: evalsPct },
        a11y_ok: a11yOk,
        coverage: traces.check_coverage,
        origin_coverage: originCoverage,
        traces,
      },
      null,
      2,
    )}\n`,
  )
}

const rel = (p) => relative(root, p).replaceAll('\\', '/')
console.log(
  `metrics/snapshot.json — ${kpis.length} KPIs, ${scores.length} inventory scores${extensive ? ' (extensive)' : ''}`,
)
console.log(`  pack ${packBytes} B · src tsx ${srcTsxBytes} B · graph ${graphBytes} B · mean query ${Math.round(meanQueryBytes)} B`)
if (extensive) console.log(`  wrote ${rel(join(root, 'metrics/last-run.json'))}`)
