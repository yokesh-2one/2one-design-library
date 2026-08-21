/*
  Validates the machine-readable data against the repo's invariants
  (PRD FR-3: reject malformed/incomplete data). Structural validation — no heavy
  deps; swap in `ajv` against schema/*.json for full JSON-Schema coverage later.

  Run: npm run validate   (exits 1 on any failure)
*/
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { INTERACTIVE } from './interactive-components.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const load = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const errors = []
const check = (cond, msg) => { if (!cond) errors.push(msg) }
const isHex = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)

// ---- manifest.json ----
try {
  const m = load('manifest.json')
  check(m.name && m.version, 'manifest: missing name/version')
  check(typeof m.description === 'string' && m.description.length > 40, 'manifest: missing plain-language description')
  check(m.instructions_for_ai && Array.isArray(m.instructions_for_ai.rules) && m.instructions_for_ai.rules.length >= 5,
    'manifest: instructions_for_ai.rules must exist with the anti-hallucination contract')
  check(m.instructions_for_ai && m.instructions_for_ai.no_hallucination, 'manifest: missing no_hallucination statement')
  check(m.index && m.index.brand && m.index.tokens && m.index.components, 'manifest: index must cover brand/tokens/components')
} catch (e) { errors.push('manifest.json: ' + e.message) }

// ---- tokens/colors.json ----
try {
  const c = load('tokens/colors.json')
  check(c.ramps && c.ramps.neutral && Object.keys(c.ramps.neutral).length >= 5, 'colors: neutral ramp missing/short')
  check(c.semantic && isHex(c.semantic.primary) && isHex(c.semantic.background), 'colors: semantic primary/background must be hex')
  check(c.contrast && Array.isArray(c.contrast.pairs) && c.contrast.pairs.length > 0, 'colors: contrast.pairs missing')
  for (const p of (c.contrast?.pairs || [])) {
    check(isHex(p.text) && isHex(p.background), `colors: pair "${p.name}" has non-hex colours`)
    check(typeof p.apca_lc === 'number' && typeof p.wcag_ratio === 'number', `colors: pair "${p.name}" missing contrast numbers`)
    check(p.passes === true, `colors: contrast pair "${p.name}" FAILS its threshold (Lc ${p.apca_lc} < ${p.apca_min}) — run npm run a11y`)
  }
} catch (e) { errors.push('tokens/colors.json: ' + e.message) }

// ---- tokens/typography.json ----
try {
  const t = load('tokens/typography.json')
  check(t.fonts && t.fonts.heading && t.fonts.body, 'typography: fonts.heading/body missing')
  check(t.scale && t.scale.base && t.scale.base.size_px === 16, 'typography: base scale must be 16px')
} catch (e) { errors.push('tokens/typography.json: ' + e.message) }

// ---- tokens/spacing.json ----
try {
  const s = load('tokens/spacing.json')
  check(s.radius && s.radius.full, 'spacing: radius.full (pill) missing')
} catch (e) { errors.push('tokens/spacing.json: ' + e.message) }

// ---- brand/brand.json ----
try {
  const b = load('brand/brand.json')
  check(b.mission && b.vision && b.tagline, 'brand: mission/vision/tagline missing')
  check(b.voice && b.tone && Array.isArray(b.personas) && b.personas.length > 0, 'brand: voice/tone/personas missing')
} catch (e) { errors.push('brand/brand.json: ' + e.message) }

// ---- schemas present ----
check(existsSync(join(root, 'schema/token.schema.json')), 'schema/token.schema.json missing')
check(existsSync(join(root, 'schema/component.schema.json')), 'schema/component.schema.json missing')

// ---- graph.json invariants (the graph must be trustworthy, not just pretty) ----
try {
  const g = load('graph.json')
  const ids = new Set(g.nodes.map((n) => n.id))
  check(ids.size === g.nodes.length, 'graph: duplicate node ids')
  // no dangling edges — every edge endpoint must be a real node
  for (const e of g.edges) {
    check(ids.has(e.source), `graph: edge source "${e.source}" is not a node`)
    check(ids.has(e.target), `graph: edge target "${e.target}" is not a node`)
  }
  // (No generic "orphan node" check: a standalone primitive like Spinner or an
  //  app-level rule like width-by-content legitimately has no edges. Dangling
  //  edges and missing coverage below are the real, unambiguous failures.)
  // coverage — every component source file must have a node
  const uiDir = join(root, 'src/components/ui')
  const oneDir = join(root, 'src/components')
  const uiFiles = (existsSync(uiDir) ? readdirSync(uiDir) : []).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''))
  const oneFiles = (existsSync(oneDir) ? readdirSync(oneDir) : []).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''))
  // ids match type: ui → component:<name>, 2one-only → component-2one:<name>
  for (const c of uiFiles) check(ids.has(`component:${c}`), `graph: component "${c}" has no node — run npm run graph`)
  for (const c of oneFiles) check(ids.has(`component-2one:${c}`), `graph: 2one component "${c}" has no component-2one node — run npm run graph`)
  // sanity: the composition layer is actually populated
  const compToComp = g.edges.filter((e) => e.source.startsWith('component:') && e.target.startsWith('component:'))
  check(compToComp.length > 0, 'graph: no component→component composed_of edges (Graph #1 regressed)')
  // governance coverage — every interactive component must be governed_by no-color-alone
  const nodeType = new Map(g.nodes.map((n) => [n.id, n.type]))
  const compIdOf = (name) => (nodeType.get(`component-2one:${name}`) ? `component-2one:${name}` : `component:${name}`)
  const governed = new Set(g.edges.filter((e) => e.type === 'governed_by' && e.target === 'rule:no-color-alone').map((e) => e.source))
  for (const name of INTERACTIVE) {
    check(governed.has(compIdOf(name)), `graph: interactive component "${name}" is not governed_by rule:no-color-alone — every state-bearing control must be (see scripts/interactive-components.mjs)`)
  }
} catch (e) { errors.push('graph.json: ' + e.message) }

// ---- report ----
if (errors.length) {
  console.error(`\n  ✗ validation failed — ${errors.length} problem(s):\n`)
  for (const e of errors) console.error('   • ' + e)
  console.error('')
  process.exit(1)
}
console.log('\n  ✓ all machine-readable data valid (manifest, tokens, brand, schemas)\n')
