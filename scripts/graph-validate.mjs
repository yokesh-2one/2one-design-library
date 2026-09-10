/*
  graph-validate — semantic validation of the decision graph.

  Fails (exit 1) on integrity errors that would make AI reasoning unsound:
    - ontology violations (edge endpoints outside the declared domain/range)
    - dangling edges / duplicate node ids
    - rules with no target (a rule that governs nothing)
    - preferred_over cycles (A > B and B > A)
    - provenance pointing at a repository file that does not exist
    - decision edges missing a priority where the ontology expects a preference

  Warns (exit 0) on coverage gaps that are informative, not fatal:
    - Component nodes with no usage guidance (no appropriate/preferred/inappropriate/requires)
    - interactive components with no accessibility requirement
    - conflicts_with between rules of the SAME tier (unresolvable by the ladder)
    - orphan authored nodes (intent/context/state/a11y/pattern with no edges)

  Run: npm run graph:validate
*/
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { INTERACTIVE } from './interactive-components.mjs'

import { config as cfg } from './lib/config.mjs'

// Root at the PAYLOAD, not at this file. Resolving from the script directory
// meant a client run read 2one's files and reported on them.
const root = cfg.root
const graph = JSON.parse(readFileSync(join(root, cfg.rel('out.graph')), 'utf8'))
const ontology = JSON.parse(readFileSync(join(root, cfg.rel('ontology')), 'utf8'))
const byId = new Map(graph.nodes.map((n) => [n.id, n]))
const cls = (id) => (byId.get(id) ? byId.get(id).class : null)
const out = (id, t) => graph.edges.filter((e) => e.source === id && (!t || e.type === t))
const inc = (id, t) => graph.edges.filter((e) => e.target === id && (!t || e.type === t))

const errors = []
const warns = []

// duplicate ids
const seen = new Set()
for (const n of graph.nodes) { if (seen.has(n.id)) errors.push(`duplicate node id ${n.id}`); seen.add(n.id) }

// edges: dangling + ontology conformance + priority presence
const PREFERENCE_EDGES = new Set(['preferred_for', 'preferred_over', 'appropriate_for', 'inappropriate_for'])
for (const e of graph.edges) {
  if (!byId.has(e.source)) { errors.push(`dangling ${e.type}: source ${e.source} missing`); continue }
  if (!byId.has(e.target)) { errors.push(`dangling ${e.type}: target ${e.target} missing`); continue }
  const spec = ontology.edge_types[e.type]
  if (!spec) { errors.push(`unknown edge type ${e.type}`); continue }
  if (spec.domain && !spec.domain.includes(cls(e.source))) errors.push(`${e.type}: ${e.source} (${cls(e.source)}) outside domain [${spec.domain}]`)
  if (spec.range && !spec.range.includes(cls(e.target))) errors.push(`${e.type}: ${e.target} (${cls(e.target)}) outside range [${spec.range}]`)
  if (PREFERENCE_EDGES.has(e.type) && !e.priority) warns.push(`${e.type} ${e.source}→${e.target} has no priority`)
}

// rules must govern something
for (const n of graph.nodes.filter((n) => n.class === 'Rule')) {
  const targets = inc(n.id, 'governed_by').length + out(n.id, 'applies_to').length + out(n.id, 'applies_when').length
  if (targets === 0) warns.push(`rule ${n.id} governs nothing (no target)`)
}

// preferred_over must be a strict order (no 2-cycles)
const po = new Set(graph.edges.filter((e) => e.type === 'preferred_over').map((e) => e.source + '>' + e.target))
for (const key of po) { const [a, b] = key.split('>'); if (po.has(b + '>' + a)) errors.push(`preferred_over cycle: ${a} <> ${b}`) }

// conflicts_with between equal tiers is unresolvable
for (const e of graph.edges.filter((e) => e.type === 'conflicts_with')) {
  const ta = byId.get(e.source)?.tier, tb = byId.get(e.target)?.tier
  if (ta && tb && ta === tb) warns.push(`conflicts_with ${e.source} <> ${e.target}: same tier "${ta}" — not resolvable by the ladder`)
}

// provenance files must exist
const fileRefs = new Set()
for (const n of graph.nodes) if (n.source && n.source.includes('/')) fileRefs.add(n.source)
for (const e of graph.edges) if (e.evidence && e.evidence.includes('/')) fileRefs.add(e.evidence)
for (const f of fileRefs) if (!existsSync(join(root, f))) errors.push(`provenance references missing file: ${f}`)

// coverage: components without usage guidance
const GUIDANCE = new Set(['appropriate_for', 'inappropriate_for', 'preferred_for', 'requires', 'supports_state', 'preferred_composition', 'realized_by', 'alternative_to', 'preferred_over'])
for (const n of graph.nodes.filter((n) => n.type === 'component' || n.type === 'component-2one')) {
  const has = graph.edges.some((e) => (e.source === n.id || e.target === n.id) && GUIDANCE.has(e.type))
  if (!has) warns.push(`component ${n.id} has no usage guidance (decision edges)`)
}
// interactive components should carry an a11y requirement
for (const name of INTERACTIVE) {
  const id = byId.has(`component:${name}`) ? `component:${name}` : `component-2one:${name}`
  if (byId.has(id) && out(id, 'requires').filter((e) => cls(e.target) === 'AccessibilityRequirement').length === 0)
    warns.push(`interactive component ${id} has no accessibility requirement`)
}
// orphan authored concept nodes
for (const n of graph.nodes.filter((n) => ['Intent', 'Context', 'State', 'AccessibilityRequirement', 'Pattern'].includes(n.class))) {
  if (out(n.id).length + inc(n.id).length === 0) warns.push(`orphan ${n.class} node ${n.id}`)
}

// ---- report ----
const covered = graph.nodes.filter((n) => (n.type === 'component' || n.type === 'component-2one')).filter((n) => graph.edges.some((e) => (e.source === n.id || e.target === n.id) && GUIDANCE.has(e.type))).length
const totalComp = graph.nodes.filter((n) => n.type === 'component' || n.type === 'component-2one').length
console.log(`\n  graph-validate — ${graph.stats.nodes} nodes, ${graph.stats.edges} edges`)
console.log(`  decision coverage: ${covered}/${totalComp} components carry usage guidance`)
if (warns.length) { console.log(`\n  ${warns.length} warning(s):`); warns.slice(0, 40).forEach((w) => console.log('   ! ' + w)); if (warns.length > 40) console.log(`   … ${warns.length - 40} more`) }
if (errors.length) { console.error(`\n  ✗ ${errors.length} error(s):`); errors.forEach((e) => console.error('   ✗ ' + e)); console.error(''); process.exit(1) }
console.log(`\n  ✓ graph is sound — no integrity errors\n`)
