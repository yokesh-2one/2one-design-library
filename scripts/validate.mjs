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

import { config as cfg } from './lib/config.mjs'

const root = cfg.root
const load = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const errors = []
const check = (cond, msg) => { if (!cond) errors.push(msg) }
const isHex = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)

// ---- manifest.json ----
try {
  const m = load(cfg.rel('out.manifest'))
  check(m.name && m.version, 'manifest: missing name/version')
  check(typeof m.description === 'string' && m.description.length > 40, 'manifest: missing plain-language description')
  check(m.instructions_for_ai && Array.isArray(m.instructions_for_ai.rules) && m.instructions_for_ai.rules.length >= 5,
    'manifest: instructions_for_ai.rules must exist with the anti-hallucination contract')
  check(m.instructions_for_ai && m.instructions_for_ai.no_hallucination, 'manifest: missing no_hallucination statement')
  check(m.index && m.index.brand && m.index.tokens && m.index.components, 'manifest: index must cover brand/tokens/components')
} catch (e) { errors.push(cfg.rel('out.manifest') + ': ' + e.message) }

// ---- tokens/colors.json ----
try {
  const c = load(`${cfg.rel('out.tokens')}/colors.json`)
  const nr = cfg.rules.neutralRamp ?? 'neutral'
  check(c.ramps && c.ramps[nr] && Object.keys(c.ramps[nr]).length >= 5, `colors: "${nr}" ramp missing or shorter than 5 steps`)
  check(c.semantic && isHex(c.semantic.primary) && isHex(c.semantic.background), 'colors: semantic primary/background must be hex')
  check(c.contrast && Array.isArray(c.contrast.pairs) && c.contrast.pairs.length > 0, 'colors: contrast.pairs missing')
  for (const p of (c.contrast?.pairs || [])) {
    check(isHex(p.text) && isHex(p.background), `colors: pair "${p.name}" has non-hex colours`)
    check(typeof p.apca_lc === 'number' && typeof p.wcag_ratio === 'number', `colors: pair "${p.name}" missing contrast numbers`)
    check(p.passes === true, `colors: contrast pair "${p.name}" FAILS its threshold (Lc ${p.apca_lc} < ${p.apca_min}) — run npm run a11y`)
  }
} catch (e) { errors.push(`${cfg.rel('out.tokens')}/colors.json: ` + e.message) }

// ---- tokens/typography.json ----
try {
  const t = load(`${cfg.rel('out.tokens')}/typography.json`)
  check(t.fonts && t.fonts.heading && t.fonts.body, 'typography: fonts.heading/body missing')
  check(t.scale && t.scale.base && t.scale.base.size_px === 16, 'typography: base scale must be 16px')
} catch (e) { errors.push(`${cfg.rel('out.tokens')}/typography.json: ` + e.message) }

// ---- tokens/spacing.json ----
try {
  const s = load(`${cfg.rel('out.tokens')}/spacing.json`)
  check(s.radius && s.radius.full, 'spacing: radius.full (pill) missing')
} catch (e) { errors.push(`${cfg.rel('out.tokens')}/spacing.json: ` + e.message) }

// ---- brand/brand.json ----
try {
  const b = load(cfg.rel('brand.structured'))
  check(b.mission && b.vision && b.tagline, 'brand: mission/vision/tagline missing')
  check(b.voice && b.tone && Array.isArray(b.personas) && b.personas.length > 0, 'brand: voice/tone/personas missing')
} catch (e) { errors.push(cfg.rel('brand.structured') + ': ' + e.message) }

/*
  ---- schemas present ----
  Optional. Schemas describe a payload's own token/component shape; a payload
  that has not authored them is incomplete, not invalid, and failing here would
  block a minimal payload from ever validating.
*/
const schemaDir = cfg.rel('schemas') ?? 'schema'
if (existsSync(join(root, schemaDir))) {
  check(existsSync(join(root, `${schemaDir}/token.schema.json`)), `${schemaDir}/token.schema.json missing`)
  check(existsSync(join(root, `${schemaDir}/component.schema.json`)), `${schemaDir}/component.schema.json missing`)
  check(existsSync(join(root, `${schemaDir}/config.schema.json`)), `${schemaDir}/config.schema.json missing`)
}

/*
  ---- dls.config.json against its own schema ----

  A payload describes itself here, and until now nothing checked that
  description. `manifest.json` advertised `schema/config.schema.json` and
  `dls.config.json` pointed its own `$schema` at the same path, but the file
  did not exist, so both references were promises to a client that could not
  be kept.

  The failure this catches is specific and silent: a mistyped path key does not
  error, it falls through to the default in lib/config.mjs, and the engine then
  operates on the 2one layout while reporting success against the client's repo.
  That is the exact class of bug the payload seam exists to prevent, so an
  unrecognised key is an error rather than a warning.

  Structural, not full JSON Schema, matching the rest of this file: walk the
  objects the schema closes with additionalProperties:false and report keys it
  does not declare. Swapping in ajv later subsumes this.
*/
if (cfg.configured) {
  try {
    const schema = load(`${schemaDir}/config.schema.json`)
    const raw = load('dls.config.json')
    const unknown = []
    const walkKeys = (node, sch, path) => {
      if (!sch || sch.additionalProperties !== false || !sch.properties) return
      for (const k of Object.keys(node)) {
        const child = sch.properties[k]
        if (!child) { unknown.push(path + k); continue }
        const v = node[k]
        if (v && typeof v === 'object' && !Array.isArray(v)) walkKeys(v, child, `${path}${k}.`)
      }
    }
    walkKeys(raw, schema, '')
    for (const k of unknown) {
      check(false, `dls.config.json: "${k}" is not a key the engine reads — it will be ignored and the default used instead`)
    }
  } catch (e) { errors.push('dls.config.json: ' + e.message) }
}

// ---- graph.json invariants (the graph must be trustworthy, not just pretty) ----
try {
  const g = load(cfg.rel('out.graph'))
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
  const uiDir = join(root, cfg.rel('components'))
  const oneDir = join(root, cfg.rel('ownComponents'))
  const uiFiles = (existsSync(uiDir) ? readdirSync(uiDir) : []).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''))
  const oneFiles = (existsSync(oneDir) ? readdirSync(oneDir) : []).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''))
  // ids match type: vendored → component:<name>, payload-authored → <ownType>:<name>
  for (const c of uiFiles) check(ids.has(`component:${c}`), `graph: component "${c}" has no node — run npm run graph`)
  const ownT = cfg.rules.ownComponentNodeType ?? 'component-own'
  for (const c of oneFiles) check(ids.has(`${ownT}:${c}`), `graph: payload-authored component "${c}" has no ${ownT} node — run npm run graph`)
  // sanity: the composition layer is actually populated
  const compToComp = g.edges.filter((e) => e.source.startsWith('component:') && e.target.startsWith('component:'))
  /*
    Composition edges only mean something once components actually compose each
    other. A payload with a handful of leaf primitives legitimately has none, so
    this asserts the capability has not regressed rather than that every payload
    must exhibit it.
  */
  if (uiFiles.length > 10) check(compToComp.length > 0, 'graph: no component→component composed_of edges (Graph #1 regressed)')
  /*
    Governance coverage — every interactive component must be governed_by
    no-color-alone.

    Only checked for components the payload ACTUALLY HAS. INTERACTIVE is 2one's
    list of stateful primitives; run unconditionally it reported that Acme was
    missing governance on `form`, `calendar` and `tabs` — components Acme does
    not have and never claimed to. Asserting another system's component set
    against a payload produces noise that reads as failure.

    Skipped entirely when the payload has not authored the rule: a payload with
    no rule:no-color-alone is not violating it, it simply has not written it.
  */
  const nodeType = new Map(g.nodes.map((n) => [n.id, n.type]))
  const ownType = cfg.rules.ownComponentNodeType ?? 'component-own'
  const compIdOf = (name) => (nodeType.get(`${ownType}:${name}`) ? `${ownType}:${name}` : `component:${name}`)
  const hasRule = g.nodes.some((n) => n.id === 'rule:no-color-alone')
  const governed = new Set(g.edges.filter((e) => e.type === 'governed_by' && e.target === 'rule:no-color-alone').map((e) => e.source))
  if (hasRule) {
    for (const name of INTERACTIVE) {
      if (!nodeType.has(compIdOf(name))) continue // not a component this payload has
      check(governed.has(compIdOf(name)), `graph: interactive component "${name}" is not governed_by rule:no-color-alone — every state-bearing control must be (see scripts/interactive-components.mjs)`)
    }
  }
} catch (e) { errors.push(cfg.rel('out.graph') + ': ' + e.message) }

// ---- report ----
if (errors.length) {
  console.error(`\n  ✗ validation failed — ${errors.length} problem(s):\n`)
  for (const e of errors) console.error('   • ' + e)
  console.error('')
  process.exit(1)
}
console.log('\n  ✓ all machine-readable data valid (manifest, tokens, brand, schemas)\n')
