/*
  check:graph-integrity — the spec, the manifest, and the graph must agree.

  A pattern (or AI component) is declared across three artefacts: its spec
  (rules/patterns|ai-components/*.json), the manifest index, and the knowledge
  graph. They drifted once — pattern:app-shell shipped in the manifest + a spec
  but had NO graph node, so `graph-decide` and `what-uses` couldn't see it, and
  nothing failed. This closes that gap.

  For every pattern + AI-component spec, assert:
    1. a graph node with the SAME id exists (the drift that bit app-shell);
    2. its declared source file (`spec.file`) and the node's `source` exist on disk
       — an implementation points at a real file; a documentation-only spec omits
       `file` and is fine, but a DANGLING file reference is not;
    3. every composed_of component and governed_by rule resolves to a real node.
  Plus: every pattern the MANIFEST indexes must be a graph node (belt-and-braces
  against the two disagreeing even when the specs are clean).

  ("Publicly exportable" — whether the pattern is in the package's exports — is a
  packaging concern tracked separately; this guard covers graph/spec/manifest
  integrity only.)

  Run: npm run check:graph-integrity
*/
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { config as cfg } from './lib/config.mjs'

const root = cfg.root
const J = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const graph = J(cfg.rel('out.graph'))
const manifest = J(cfg.rel('out.manifest'))
const byId = new Map(graph.nodes.map((n) => [n.id, n]))
const OWN = cfg.rules?.ownComponentNodeType ?? 'component-own'
const compId = (name) => (byId.has(`${OWN}:${name}`) ? `${OWN}:${name}` : `component:${name}`)
const errors = []

for (const { label, dirKey } of [{ label: 'pattern', dirKey: 'patternSpecs' }, { label: 'ai-component', dirKey: 'aiComponentSpecs' }]) {
  let dir
  try { dir = cfg.rel(dirKey) } catch { continue }
  if (!existsSync(join(root, dir))) continue
  for (const f of readdirSync(join(root, dir)).filter((x) => x.endsWith('.json'))) {
    const where = `${dir}/${f}`
    let spec
    try { spec = J(where) } catch (e) { errors.push(`${where}: invalid JSON (${e.message})`); continue }
    const id = spec.id
    if (!id) { errors.push(`${where}: spec has no id`); continue }

    const node = byId.get(id)
    if (!node) { errors.push(`${where}: "${id}" has NO node in graph.json — drift (the spec/manifest declare it, the graph does not)`); continue }
    if (node.type !== label) errors.push(`${where}: node "${id}" is type "${node.type}", expected "${label}"`)

    if (spec.file && !existsSync(join(root, spec.file))) errors.push(`${where}: declared file "${spec.file}" does not exist`)
    if (node.source && !existsSync(join(root, node.source))) errors.push(`${where}: node source "${node.source}" does not exist`)

    for (const c of spec.composes?.components ?? []) {
      const cid = compId(c)
      if (!byId.has(cid)) errors.push(`${where}: composes component "${c}" but there is no graph node (${cid})`)
    }
    for (const r of spec.governed_by ?? []) {
      if (!byId.has(`rule:${r}`)) errors.push(`${where}: governed_by rule "${r}" but there is no rule:${r} node`)
    }
  }
}

for (const s of manifest.index?.templates?.patterns?.spec ?? []) {
  const id = typeof s === 'string' ? s : s.id
  if (id && !byId.has(id)) errors.push(`manifest indexes pattern "${id}" but graph.json has no such node`)
}

if (errors.length) {
  console.error('\n  ✗ check:graph-integrity — spec / manifest / graph drift:\n')
  for (const e of errors) console.error(`    • ${e}`)
  console.error('')
  process.exit(1)
}
console.log('  ✓ check:graph-integrity — every pattern + AI component has a matching graph node, a real source, and valid composition/governance targets.')
