/*
  Builds graph.json — a knowledge graph of the DLS. Nodes = design elements
  (brand, tokens, components, templates, rules, contrast facts); edges = the
  relationships that carry context (composed_of, uses, derived_from, governed_by,
  has_contrast, embodies). Generated from the repo so it never drifts.

  Run: npm run graph
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const R = (p) => readFileSync(join(root, p), 'utf8')
const J = (p) => JSON.parse(R(p))
const ls = (rel, f = () => true) => existsSync(join(root, rel)) ? readdirSync(join(root, rel)).filter(f) : []
const baseName = (f) => f.replace(/\.[^.]+$/, '')

const nodes = new Map()
const edges = []
const addNode = (id, type, label, extra = {}) => { if (!nodes.has(id)) nodes.set(id, { id, type, label, ...extra }) }
const addEdge = (source, target, type) => { if (nodes.has(source) && nodes.has(target)) edges.push({ source, target, type }) }

const colors = J('tokens/colors.json')
const type = J('tokens/typography.json')
const space = J('tokens/spacing.json')
const brand = J('brand/brand.json')

// ---- TOKEN nodes ----
const SEMANTIC = Object.keys(colors.semantic)
for (const k of SEMANTIC) addNode(`token:${k}`, 'token-color', k, { hex: colors.semantic[k] })
for (const [ramp, steps] of Object.entries(colors.ramps))
  for (const [step, hex] of Object.entries(steps)) addNode(`ramp:${ramp}-${step}`, 'ramp', `${ramp}-${step}`, { hex })
for (const k of Object.keys(space.radius)) addNode(`radius:${k}`, 'token-radius', `radius-${k}`, { value: space.radius[k] })
for (const k of Object.keys(type.scale)) addNode(`type:${k}`, 'token-type', `text-${k}`, { px: type.scale[k].size_px })

// derived_from: semantic colour → the ramp step with the same hex
const hexToRamp = {}
for (const [ramp, steps] of Object.entries(colors.ramps)) for (const [step, hex] of Object.entries(steps)) hexToRamp[hex.toLowerCase()] = `ramp:${ramp}-${step}`
for (const k of SEMANTIC) { const r = hexToRamp[(colors.semantic[k] || '').toLowerCase()]; if (r) addEdge(`token:${k}`, r, 'derived_from') }

// ---- COMPONENT nodes + composed_of edges (parse the source for token classes) ----
const titleize = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')
const componentFiles = [
  ...ls('src/components/ui', (f) => f.endsWith('.tsx')).map((f) => ['component', 'src/components/ui/' + f, baseName(f)]),
  ...ls('src/components', (f) => f.endsWith('.tsx')).map((f) => ['component-2one', 'src/components/' + f, baseName(f)]),
]
const compId = (name) => `component:${name}`
for (const [kind, path, name] of componentFiles) addNode(compId(name), kind, titleize(name), { path })

const utilRe = (tok) => new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|placeholder|divide|caret|decoration|shadow)-${tok}(?:/\\d+)?\\b`)
for (const [, path, name] of componentFiles) {
  const src = R(path)
  for (const k of SEMANTIC) if (utilRe(k).test(src)) addEdge(compId(name), `token:${k}`, 'composed_of')
  if (/\bborder(?:-\d)?\b/.test(src) && !src.match(utilRe('border'))) addEdge(compId(name), 'token:border', 'composed_of')
  for (const k of Object.keys(space.radius)) if (new RegExp(`\\brounded-${k}\\b`).test(src)) addEdge(compId(name), `radius:${k}`, 'composed_of')
  for (const k of Object.keys(type.scale)) if (new RegExp(`\\btext-${k}\\b`).test(src)) addEdge(compId(name), `type:${k}`, 'composed_of')
}
// Button is a pill via the globals.css [data-slot=button] override, not its own class
addEdge('component:button', 'radius:full', 'composed_of')

// ---- TEMPLATE nodes + uses edges (parse imports of @/components/...) ----
const importedComponents = (src) => {
  const set = new Set()
  for (const m of src.matchAll(/from\s+['"]@\/components\/(?:ui\/)?([a-z0-9-]+)['"]/g)) set.add(m[1])
  return set
}
const addTemplate = (id, label, type, files) => {
  addNode(id, type, label)
  const used = new Set()
  for (const f of files) for (const c of importedComponents(R(f))) used.add(c)
  for (const c of used) if (nodes.has(compId(c))) addEdge(id, compId(c), 'uses')
}
for (const f of ls('src/blocks', (f) => f.endsWith('.tsx'))) addTemplate(`block:${baseName(f)}`, baseName(f), 'template-block', ['src/blocks/' + f])
if (existsSync(join(root, 'src/blocks/dashboard-plain')))
  addTemplate('block:dashboard-plain', 'dashboard-plain', 'template-block', ls('src/blocks/dashboard-plain', (f) => f.endsWith('.tsx')).map((f) => 'src/blocks/dashboard-plain/' + f))
for (const f of ls('src/blocks/charts', (f) => f.endsWith('.tsx'))) addTemplate(`chart:${baseName(f)}`, baseName(f), 'template-chart', ['src/blocks/charts/' + f])

// ---- RULE nodes + governed_by ----
const rule = (id, label, targets) => { addNode(`rule:${id}`, 'rule', label); for (const t of targets) addEdge(t, `rule:${id}`, 'governed_by') }
rule('grayscale', 'Grayscale only — no brand hue', ['token:primary', 'token:secondary', 'token:muted', 'token:accent', 'token:background'])
rule('validation-only', 'danger/success for validation only', ['token:destructive', 'token:success'])
rule('no-color-alone', 'Never convey state by colour alone', ['token:destructive', 'token:success'])
rule('pill-buttons', 'Buttons are pills (radius-full)', ['component:button', 'radius:full'])
rule('logo-untouchable', 'Logo: never recolour/rotate/distort', ['component:logo'])
rule('one-primary', 'One primary action per view', ['component:button'])

// ---- CONTRAST facts + has_contrast ----
for (const p of colors.contrast.pairs) {
  const id = `contrast:${p.name}`
  addNode(id, 'contrast', `${p.name} (Lc ${p.apca_lc})`, { apca_lc: p.apca_lc, wcag_ratio: p.wcag_ratio, passes: p.passes })
  const t = `token:${p.name.includes('primary') ? 'primary-foreground' : p.name.includes('destructive') ? 'destructive' : 'foreground'}`
  if (nodes.has(t)) addEdge(t, id, 'has_contrast')
}

// ---- BRAND nodes + embodies ----
addNode('brand:mission', 'brand', 'Mission', { value: brand.mission })
addNode('brand:voice', 'brand', 'Voice: ' + brand.voice.descriptors.join(', '))
addNode('brand:tone', 'brand', 'Tone: ' + brand.tone.descriptors.join(', '))
for (const p of brand.personas) addNode(`persona:${p.id}`, 'brand', p.label)
addEdge('brand:voice', 'rule:grayscale', 'embodies')
addEdge('brand:voice', 'rule:pill-buttons', 'embodies')
addEdge('brand:voice', 'rule:no-color-alone', 'embodies')

// ---- write ----
const nodeArr = [...nodes.values()]
const stats = {
  nodes: nodeArr.length,
  edges: edges.length,
  by_node_type: nodeArr.reduce((a, n) => ((a[n.type] = (a[n.type] || 0) + 1), a), {}),
  by_edge_type: edges.reduce((a, e) => ((a[e.type] = (a[e.type] || 0) + 1), a), {}),
}
// No generated timestamp: keep the output deterministic so the CI "generated files
// in sync" guard never fails just because the clock ticked over (git history has the date).
writeFileSync(join(root, 'graph.json'), JSON.stringify({
  name: '2one DLS knowledge graph',
  description: 'Design elements as nodes; relationships (composed_of, uses, derived_from, governed_by, has_contrast, embodies) as edges. Generated by scripts/build-graph.mjs.',
  stats, nodes: nodeArr, edges,
}, null, 2) + '\n')
console.log(`graph.json — ${stats.nodes} nodes, ${stats.edges} edges`)
console.log('  nodes:', JSON.stringify(stats.by_node_type))
console.log('  edges:', JSON.stringify(stats.by_edge_type))
