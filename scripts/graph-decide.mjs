/*
  graph-decide — the deterministic reasoning layer over graph.json.

  Turns an intent (+ optional context) into a 2one design decision: the preferred
  pattern/component, its composition, the mandatory rules, the anti-patterns to
  avoid, the accessibility requirements, and the provenance for each — resolving
  rule conflicts by the ontology's tier ladder. Same graph in → same answer out.

  Usage:
    node scripts/graph-decide.mjs decide <intent> [--context <ctx>] [--json]
    node scripts/graph-decide.mjs rules <node>            # rules governing a node
    node scripts/graph-decide.mjs alternatives <node>     # what to use instead
    node scripts/graph-decide.mjs incompatible <node>     # forbidden compositions
    node scripts/graph-decide.mjs a11y <node>             # accessibility requirements
    node scripts/graph-decide.mjs states <node>           # supported interaction states
    node scripts/graph-decide.mjs why <source> <target>   # evidence for a relationship

  <intent>/<node> may be an id (intent:submit-form, component:button) or a label
  substring (submit, Button). Add --json for machine output.
*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const graph = JSON.parse(readFileSync(join(root, 'graph.json'), 'utf8'))
const ontology = JSON.parse(readFileSync(join(root, 'graph/ontology.json'), 'utf8'))

const byId = new Map(graph.nodes.map((n) => [n.id, n]))
const label = (id) => (byId.get(id) ? byId.get(id).label : id)
const cls = (id) => (byId.get(id) ? byId.get(id).class : '?')
const PRIO = ontology.priority.order // strongest preference first for PREFERRED..., strongest prohibition last
const prioRank = (p) => { const i = PRIO.indexOf(p); return i < 0 ? 99 : i }
const TIER = Object.fromEntries(ontology.conflict_precedence.ladder.map((t) => [t.id, t.tier]))
const tierRank = (t) => TIER[t] || 99

const out = (id, type) => graph.edges.filter((e) => e.source === id && (!type || e.type === type))
const inc = (id, type) => graph.edges.filter((e) => e.target === id && (!type || e.type === type))

// ---- fuzzy matching: normalise so "show profile" matches "Show a profile" and
//      order / articles / plurals don't block a hit. Nodes may carry `aliases`.
const STOP = new Set(['a', 'an', 'the', 'to', 'of', 'for', 'and', 'or', 'with', 'in', 'on', 'your', 'my', 'this', 'that', 'me'])
const normTokens = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
  .filter((t) => t && !STOP.has(t)).map((t) => t.replace(/s$/, ''))
const tokset = (s) => new Set(normTokens(s))
const nodeTokens = (n) => tokset([n.label, ...(n.aliases || [])].join(' '))

// resolve a query string to a node id, optionally constrained to a class
function resolve(q, klass) {
  if (q == null) return null
  if (byId.has(q)) return q
  const ql = String(q).toLowerCase()
  const inClass = (n) => !klass || n.class === klass
  // 1. exact id or label · 2. exact alias · 3. substring on id/label
  let m = graph.nodes.filter((n) => inClass(n) && (n.id.toLowerCase() === ql || n.label.toLowerCase() === ql))
  if (!m.length) m = graph.nodes.filter((n) => inClass(n) && (n.aliases || []).some((a) => String(a).toLowerCase() === ql))
  if (!m.length) m = graph.nodes.filter((n) => inClass(n) && (n.id.toLowerCase().includes(ql) || n.label.toLowerCase().includes(ql)))
  if (m.length) { m.sort((a, b) => a.id.localeCompare(b.id)); return m[0].id }
  // 4. normalised token match — every query token present in the node's label+aliases
  const Q = tokset(q)
  if (Q.size) {
    const cand = graph.nodes.filter(inClass).map((n) => ({ id: n.id, N: nodeTokens(n) }))
      .filter(({ N }) => [...Q].every((t) => N.has(t)))
      .map(({ id, N }) => ({ id, extra: N.size - Q.size }))
      .sort((a, b) => a.extra - b.extra || a.id.localeCompare(b.id))
    if (cand.length) return cand[0].id
  }
  return null
}

// closest intents to a free-text query — for the "no exact match" hint (D3).
function suggestIntents(q, limit = 3) {
  const Q = tokset(q)
  if (!Q.size) return []
  return graph.nodes.filter((n) => n.class === 'Intent')
    .map((n) => { const N = nodeTokens(n); return { id: n.id, label: n.label, shared: [...Q].filter((t) => N.has(t)).length } })
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.id.localeCompare(b.id))
    .slice(0, limit)
}

// rules governing a node: governed_by out-edges + applies_to in-edges, with metadata
function rulesFor(id) {
  const ids = new Set([...out(id, 'governed_by').map((e) => e.target), ...inc(id, 'applies_to').map((e) => e.source)])
  return [...ids].map((rid) => byId.get(rid)).filter(Boolean)
    .map((r) => ({ id: r.id, label: r.label, priority: r.priority || 'ALLOWED', tier: r.tier || 'component', kind: r.kind || 'guideline' }))
    .sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.id.localeCompare(b.id))
}

const a11yFor = (id) => out(id, 'requires').filter((e) => cls(e.target) === 'AccessibilityRequirement')
  .map((e) => ({ id: e.target, label: label(e.target), evidence: e.evidence })).sort((a, b) => a.id.localeCompare(b.id))
const statesFor = (id) => out(id, 'supports_state').map((e) => ({ id: e.target, label: label(e.target) })).sort((a, b) => a.id.localeCompare(b.id))

// components a pattern/decision expands to (self if it is a component/variant)
function componentsOf(id) {
  if (cls(id) === 'Component') return [id]
  if (cls(id) === 'Pattern') return out(id, 'preferred_composition').map((e) => e.target)
  return [id]
}

// ---- the core decision ----
function decide(intentQ, context) {
  const intent = resolve(intentQ, 'Intent') || resolve(intentQ)
  if (!intent) {
    const suggestions = suggestIntents(intentQ)
    return {
      error: `No intent matches "${intentQ}"`,
      suggestions: suggestions.map((s) => ({ id: s.id, label: s.label })),
      guidance: suggestions.length
        ? `Did you mean: ${suggestions.map((s) => s.label).join(' · ')}? Pass an intent id, e.g. "${suggestions[0].id.replace('intent:', '')}".`
        : 'No close intent. A product-domain intent (a meeting, a checkout, a booking) is not in the core graph — add it as a domain pack: see docs/domain-packs.md.',
    }
  }
  const ctx = context ? (resolve(context, 'Context') || context) : null

  // candidate realisations: realized_by (intent→X) + preferred_for (X→intent) + appropriate_for
  const cands = new Map() // id -> {priority}
  const add = (id, prio) => { const r = prioRank(prio); if (!cands.has(id) || r < prioRank(cands.get(id))) cands.set(id, prio) }
  for (const e of out(intent, 'realized_by')) add(e.target, e.priority || 'PREFERRED')
  for (const e of inc(intent, 'preferred_for')) add(e.source, e.priority || 'PREFERRED')
  for (const e of inc(intent, 'appropriate_for')) add(e.source, e.priority || 'ALLOWED')
  // remove ones explicitly inappropriate for this intent
  const badForIntent = new Set(inc(intent, 'inappropriate_for').map((e) => e.source))
  for (const id of [...cands.keys()]) if (badForIntent.has(id)) cands.delete(id)

  // context adjustment: a preferred_over edge whose context matches promotes the winner
  const contextNotes = []
  if (ctx) {
    for (const e of graph.edges.filter((x) => x.type === 'preferred_over' && x.context === ctx)) {
      if (cands.has(e.target) || componentsOf([...cands.keys()][0] || '').includes(e.target)) {
        add(e.source, 'PREFERRED'); cands.delete(e.target)
        contextNotes.push({ prefer: e.source, over: e.target, because: label(ctx), evidence: e.evidence })
      }
    }
    // also swap a directly context-appropriate component if a candidate is inappropriate for ctx
    for (const id of [...cands.keys()]) {
      const bad = out(id, 'inappropriate_for').find((e) => e.target === ctx)
      if (bad) {
        const better = graph.edges.find((e) => e.type === 'preferred_over' && e.target === id && e.context === ctx)
        if (better) { add(better.source, 'PREFERRED'); cands.delete(id); contextNotes.push({ prefer: better.source, over: id, because: label(ctx), evidence: better.evidence }) }
      }
    }
  }

  if (!cands.size) return { intent, context: ctx, error: 'No preferred realisation is encoded for this intent.' }
  // pick: best priority, then deterministic id order
  const chosen = [...cands.entries()].sort((a, b) => prioRank(a[1]) - prioRank(b[1]) || a[0].localeCompare(b[0]))[0][0]
  const alternatives = [...cands.keys()].filter((id) => id !== chosen)
    .concat(out(chosen, 'alternative_to').map((e) => e.target), inc(chosen, 'alternative_to').map((e) => e.source))
  const composition = cls(chosen) === 'Pattern' ? out(chosen, 'preferred_composition').map((e) => e.target) : []
  // a variant inherits its parent component's rules/a11y (follow `specializes`)
  const withParents = (ids) => [...new Set(ids.flatMap((id) => [id, ...out(id, 'specializes').map((e) => e.target)]))]
  const comps = withParents([...new Set([chosen, ...componentsOf(chosen), ...composition])])

  // rules across the chosen surface, deduped, tier-sorted; split mandatory vs preferred
  const ruleMap = new Map()
  for (const c of [chosen, ...comps]) for (const r of rulesFor(c)) ruleMap.set(r.id, r)
  const rules = [...ruleMap.values()].sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.id.localeCompare(b.id))
  const mandatory = rules.filter((r) => r.priority === 'MANDATORY' || r.priority === 'FORBIDDEN')

  // anti-patterns: inappropriate_for / forbidden_with touching the chosen surface + antipattern rules
  const anti = []
  for (const c of [chosen, ...comps]) {
    for (const e of out(c, 'inappropriate_for')) anti.push({ subject: c, avoid: `for ${label(e.target)}`, priority: e.priority, evidence: e.evidence })
    for (const e of out(c, 'forbidden_with')) anti.push({ subject: c, avoid: `with ${label(e.target)}`, priority: e.priority || 'FORBIDDEN', evidence: e.evidence })
  }
  for (const r of rules) if (r.kind === 'antipattern') anti.push({ subject: 'rule', avoid: r.label, priority: r.priority })
  const antiSeen = new Set()
  const antiUniq = anti.filter((a) => { const k = a.subject + '|' + a.avoid; return antiSeen.has(k) ? false : antiSeen.add(k) })

  // accessibility across the surface
  const a11yMap = new Map()
  for (const c of comps) for (const a of a11yFor(c)) a11yMap.set(a.id, a)
  const a11y = [...a11yMap.values()].sort((a, b) => a.id.localeCompare(b.id))

  return {
    intent, intent_label: label(intent), context: ctx, context_label: ctx ? label(ctx) : null,
    decision: chosen, decision_label: label(chosen), decision_class: cls(chosen),
    context_overrides: contextNotes,
    composition: composition.map((id) => ({ id, label: label(id) })),
    mandatory_rules: mandatory, all_rules: rules,
    anti_patterns: antiUniq, accessibility: a11y,
    alternatives: [...new Set(alternatives)].map((id) => ({ id, label: label(id) })),
  }
}

// ---- CLI ----
const args = process.argv.slice(2)
const json = args.includes('--json')
const ctxFlag = (() => { const i = args.indexOf('--context'); return i >= 0 ? args[i + 1] : null })()
const pos = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--context')
const cmd = pos[0]

// Required positional args per command — fail with a clean usage line, never a stack trace.
const NEEDS_ARG = { decide: 1, rules: 1, alternatives: 1, incompatible: 1, a11y: 1, states: 1, check: 2, why: 2 }
if (NEEDS_ARG[cmd] && !pos[NEEDS_ARG[cmd]]) {
  const shape = cmd === 'check' || cmd === 'why' ? '<source-id> <target-id>' : '<node-id-or-label>'
  console.error(`Usage: graph-decide ${cmd} ${shape}${cmd === 'decide' ? ' [--context <ctx>]' : ''}`)
  process.exit(1)
}

function print(obj) { console.log(JSON.stringify(obj, null, 2)) }

if (cmd === 'decide') {
  const r = decide(pos[1], ctxFlag)
  if (json) { print(r); process.exit(r.error ? 1 : 0) }
  if (r.error) { console.error(r.error); process.exit(1) }
  const bar = '─'.repeat(58)
  console.log(`\n${bar}\n  INTENT   ${r.intent_label}${r.context_label ? '   ·   CONTEXT ' + r.context_label : ''}\n${bar}`)
  console.log(`\n  ✓ USE   ${r.decision_label}   (${r.decision})   [${r.decision_class}]`)
  for (const c of r.context_overrides) console.log(`     ↳ ${label(c.prefer)} preferred over ${label(c.over)} — ${c.because}  (${c.evidence || 'authored'})`)
  if (r.composition.length) console.log(`\n  COMPOSE WITH   ${r.composition.map((c) => c.label).join(' · ')}`)
  if (r.mandatory_rules.length) { console.log(`\n  MANDATORY RULES (by tier):`); r.mandatory_rules.forEach((x) => console.log(`     • [${x.priority}/${x.tier}] ${x.label}`)) }
  if (r.anti_patterns.length) { console.log(`\n  AVOID:`); r.anti_patterns.forEach((x) => console.log(`     ✗ [${x.priority || 'AVOID'}] ${x.subject === 'rule' ? '' : label(x.subject) + ' '}${x.avoid}`)) }
  if (r.accessibility.length) { console.log(`\n  ACCESSIBILITY:`); r.accessibility.forEach((a) => console.log(`     ♿ ${a.label}  (${a.evidence || 'authored'})`)) }
  if (r.alternatives.length) console.log(`\n  ALTERNATIVES   ${r.alternatives.map((a) => a.label).join(' · ')}`)
  console.log('')
} else if (cmd === 'rules') {
  const id = resolve(pos[1]); const r = rulesFor(id)
  if (json) print({ node: id, rules: r })
  else { console.log(`\n  Rules governing ${label(id)} (${id}), strongest tier first:`); r.forEach((x) => console.log(`   • [${x.priority}/${x.tier}] ${x.label}  (${x.id})`)); console.log('') }
} else if (cmd === 'alternatives') {
  const id = resolve(pos[1])
  const alt = [...out(id, 'alternative_to'), ...inc(id, 'alternative_to'), ...inc(id, 'preferred_over').map((e) => ({ ...e, note: 'this is preferred over ' + e.target })), ...out(id, 'preferred_over')]
  const list = [...new Set([...out(id, 'alternative_to').map((e) => e.target), ...inc(id, 'alternative_to').map((e) => e.source), ...inc(id, 'preferred_over').map((e) => e.source)])]
  if (json) print({ node: id, alternatives: list })
  else { console.log(`\n  Alternatives to ${label(id)}:`); list.forEach((a) => console.log(`   • ${label(a)}  (${a})`)); if (!list.length) console.log('   (none encoded)'); console.log('') }
} else if (cmd === 'incompatible') {
  const id = resolve(pos[1])
  const list = [...out(id, 'forbidden_with').map((e) => e.target), ...inc(id, 'forbidden_with').map((e) => e.source)]
  if (json) print({ node: id, forbidden_with: list })
  else { console.log(`\n  Must NOT be composed with ${label(id)}:`); list.forEach((a) => console.log(`   ✗ ${label(a)}`)); if (!list.length) console.log('   (none encoded)'); console.log('') }
} else if (cmd === 'a11y') {
  const id = resolve(pos[1]); const r = a11yFor(id)
  if (json) print({ node: id, accessibility: r })
  else { console.log(`\n  Accessibility requirements for ${label(id)}:`); r.forEach((a) => console.log(`   ♿ ${a.label}  (${a.evidence || 'authored'})`)); if (!r.length) console.log('   (none encoded)'); console.log('') }
} else if (cmd === 'states') {
  const id = resolve(pos[1]); const r = statesFor(id)
  if (json) print({ node: id, states: r })
  else { console.log(`\n  ${label(id)} supports states: ${r.map((s) => s.label).join(', ') || '(none encoded)'}\n`) }
} else if (cmd === 'check') {
  // check <component> <intent|context> → is this a valid choice? YES / NO / UNSPECIFIED
  const s = resolve(pos[1]), t = resolve(pos[2])
  const rels = graph.edges.filter((e) => e.source === s && e.target === t)
  const negative = rels.filter((e) => e.type === 'inappropriate_for' || e.type === 'forbidden_with')
  const positive = rels.filter((e) => ['preferred_for', 'appropriate_for', 'realized_by', 'requires', 'supports_state'].includes(e.type))
  const verdict = negative.length ? 'NO' : positive.length ? 'YES' : 'UNSPECIFIED'
  // rules governing the source, following `specializes` so a variant inherits its parent's rules
  const surface = [s, ...out(s, 'specializes').map((e) => e.target)]
  const governing = [...new Map(surface.flatMap((x) => rulesFor(x)).map((r) => [r.id, r])).values()]
    .sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.id.localeCompare(b.id))
  const res = { source: s, target: t, verdict, evidence: (negative[0] || positive[0] || {}).evidence, relations: rels.map((e) => ({ type: e.type, priority: e.priority, evidence: e.evidence })), governing_rules: governing.map((r) => r.id) }
  if (json) { print(res); process.exit(0) }
  console.log(`\n  Can ${label(s)} be used for ${label(t)}?  →  ${verdict}`)
  rels.forEach((e) => console.log(`   ${e.type}  [${e.priority || '-'}]  ${e.evidence || ''}`))
  if (governing.length) console.log(`   governed by: ${governing.map((r) => r.label).join(' · ')}`)
  console.log('')
} else if (cmd === 'why') {
  const s = resolve(pos[1]), t = resolve(pos[2])
  const es = graph.edges.filter((e) => e.source === s && e.target === t)
  if (json) print({ source: s, target: t, edges: es })
  else { console.log(`\n  ${label(s)} → ${label(t)}:`); es.forEach((e) => console.log(`   ${e.type}  [${e.priority || '-'}/${e.prov}]  evidence: ${e.evidence || 'n/a'}`)); if (!es.length) console.log('   (no direct relationship)'); console.log('') }
} else {
  console.error('Usage: graph-decide <decide|rules|alternatives|incompatible|a11y|states|why> …  (see file header)')
  process.exit(1)
}
