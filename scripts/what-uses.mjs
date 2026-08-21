/*
  what-uses — impact analysis over the DLS knowledge graph (graph.json).

  Answers "if I change / remove X, what is affected?" by traversing the
  composed_of + uses edges. Built for both people and AI agents.

  Usage:
    npm run what-uses -- <query>            e.g.  npm run what-uses -- primary
    node scripts/what-uses.mjs <query> [--json] [--depends]

    <query>   a node id (token:primary) or a label substring (primary, Button, radius-full)
    --json    machine-readable output (for an AI/tool)
    --depends also show what X itself depends on + the rules governing it
*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

const root = cfg.root
const graph = JSON.parse(readFileSync(join(root, 'graph.json'), 'utf8'))
const byId = new Map(graph.nodes.map((n) => [n.id, n]))
const label = (id) => (byId.get(id) ? byId.get(id).label : id)
const typeOf = (id) => (byId.get(id) ? byId.get(id).type : '?')

const args = process.argv.slice(2)
const json = args.includes('--json')
const showDepends = args.includes('--depends')
const query = args.filter((a) => !a.startsWith('--')).join(' ').trim()

if (!query) {
  console.error('Usage: node scripts/what-uses.mjs <node id or label> [--json] [--depends]')
  process.exit(1)
}

// ---- resolve the query to a node ----
let node = byId.get(query)
if (!node) {
  const q = query.toLowerCase()
  const matches = graph.nodes.filter((n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
  if (matches.length === 0) { console.error(`No element matches "${query}".`); process.exit(1) }
  if (matches.length > 1) {
    const exact = matches.filter((n) => n.label.toLowerCase() === q)
    if (exact.length === 1) node = exact[0]
    else {
      console.error(`"${query}" is ambiguous — ${matches.length} matches. Be specific:`)
      matches.slice(0, 20).forEach((n) => console.error(`  ${n.id}   (${n.label})`))
      process.exit(1)
    }
  } else node = matches[0]
}

// ---- edges that mean "source depends on target" ----
const DEP = new Set(['composed_of', 'uses'])
const dependEdges = graph.edges.filter((e) => DEP.has(e.type))

// direct dependents = who points at `node`
const directDependents = dependEdges.filter((e) => e.target === node.id).map((e) => e.source)

// transitive impact = reverse BFS (everything upstream that would be affected)
const impacted = new Set()
let frontier = [node.id]
while (frontier.length) {
  const next = []
  for (const id of frontier) {
    for (const e of dependEdges) {
      if (e.target === id && !impacted.has(e.source)) { impacted.add(e.source); next.push(e.source) }
    }
  }
  frontier = next
}

const groupByType = (ids) => {
  const g = {}
  for (const id of ids) (g[typeOf(id)] = g[typeOf(id)] || []).push(label(id))
  return g
}

const result = {
  element: { id: node.id, type: node.type, label: node.label },
  direct_dependents: { count: directDependents.length, by_type: groupByType(directDependents) },
  total_impact: { count: impacted.size, by_type: groupByType([...impacted]) },
}
if (showDepends) {
  result.depends_on = groupByType(dependEdges.filter((e) => e.source === node.id).map((e) => e.target))
  result.governed_by = graph.edges.filter((e) => e.source === node.id && e.type === 'governed_by').map((e) => label(e.target))
  const df = graph.edges.filter((e) => e.source === node.id && e.type === 'derived_from').map((e) => label(e.target))
  if (df.length) result.derived_from = df
}

if (json) { console.log(JSON.stringify(result, null, 2)); process.exit(0) }

// ---- human report ----
const bar = '─'.repeat(52)
console.log(`\n${bar}\n  ${node.label}   ${node.hex || node.value || ''}\n  ${node.type} · ${node.id}\n${bar}`)
console.log(`\n  IMPACT — change or remove this and ${result.total_impact.count} element(s) are affected:`)
for (const [t, arr] of Object.entries(result.total_impact.by_type).sort((a, b) => b[1].length - a[1].length))
  console.log(`    ${t.padEnd(16)} ${arr.length.toString().padStart(3)}  ${arr.slice(0, 12).join(', ')}${arr.length > 12 ? ' …' : ''}`)
if (result.total_impact.count === 0) console.log('    (nothing depends on this yet)')
console.log(`\n  Directly used by ${result.direct_dependents.count}:`)
for (const [t, arr] of Object.entries(result.direct_dependents.by_type))
  console.log(`    ${t.padEnd(16)} ${arr.join(', ')}`)
if (showDepends) {
  if (result.depends_on && Object.keys(result.depends_on).length) {
    console.log(`\n  It is composed of / uses:`)
    for (const [t, arr] of Object.entries(result.depends_on)) console.log(`    ${t.padEnd(16)} ${arr.join(', ')}`)
  }
  if (result.governed_by && result.governed_by.length) console.log(`\n  Governed by: ${result.governed_by.join(' · ')}`)
  if (result.derived_from) console.log(`  Derived from: ${result.derived_from.join(', ')}`)
}
console.log('')
