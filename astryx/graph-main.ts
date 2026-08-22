// @ts-nocheck
// Knowledge-graph explorer, loaded as a Vite module (data imported directly).
import '../src/styles/globals.css' // DLS tokens + audited dark theme + Inter/Satoshi — single source, no hard-coded palette
import graph from './graph.json'
const GRAPH = graph as any

// lucide icons only (no mixed icon set): raw path data → an inline SVG string
const IC: Record<string, string> = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  externalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>',
}
const lucide = (name: string, size = 15) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name]}</svg>`

// Node families — the ordered grouping shared by the filter chips AND the legend
const FAMILY_ORDER = ['Identity', 'Governance', 'Renders on screen', 'Templates', 'Raw token values', 'External', 'Accessibility', 'Other']

// Categorical palette drawn from a Japanese ukiyo-e woodblock print (bonsai pine on a
// sea cliff under a red sun). Each node family borrows a colour eyedropped from a region
// of that painting — see the guide's "Why these colours?" note. `src` names the region.
// (The DLS *product* is grayscale; this explorer is an internal wayfinding tool, so it may
//  use hue to separate the node families — nothing here ships as a token.)
const TYPES: Record<string, any> = {
  'brand': { label: 'Brand', light: '#e8431c', dark: '#ff6b47', family: 'Identity', src: 'the setting sun' },
  'rule': { label: 'Rule', light: '#c0341a', dark: '#f26a4e', ring: true, family: 'Governance', src: "the sun's deep-red band" },
  'component': { label: 'Component', light: '#2e5f86', dark: '#6ba0cc', family: 'Renders on screen', src: 'the ocean waves' },
  'component-2one': { label: '2one-only', light: '#16324f', dark: '#4e80b0', family: 'Renders on screen', src: 'the bonsai pine' },
  'template-block': { label: 'Block', light: '#e8822f', dark: '#f4a65c', family: 'Templates', src: 'the sunset clouds' },
  'template-chart': { label: 'Chart', light: '#c98a3f', dark: '#e3b079', family: 'Templates', src: 'the pale horizon glow' },
  'token-color': { label: 'Colour token', light: '#8a5a2b', dark: '#c08a50', family: 'Raw token values', src: 'the cliff rock' },
  'ramp': { label: 'Ramp step', light: '#5a3d28', dark: '#9a6e4a', family: 'Raw token values', src: "the rock's shadow" },
  'token-radius': { label: 'Radius', light: '#5a87a6', dark: '#8fb4ce', family: 'Raw token values', src: 'the mid-tone swell' },
  'token-type': { label: 'Type', light: '#6e97a3', dark: '#a6c4cd', family: 'Raw token values', src: 'the sea-foam' },
  'package': { label: 'Package', light: '#77736c', dark: '#a8a199', family: 'External', src: 'the weathered stone' },
  'contrast': { label: 'Contrast', light: '#15803d', dark: '#4ade80', semantic: true, family: 'Accessibility', src: 'kept green — it flags pass / fail' },
}
const REL: Record<string, any> = {
  composed_of: { out: 'Composed of', in: 'Used by' }, uses: { out: 'Uses', in: 'Used by' },
  derived_from: { out: 'Derived from', in: 'Source of' }, governed_by: { out: 'Governed by', in: 'Governs' },
  has_contrast: { out: 'Contrast', in: 'Contrast of' }, embodies: { out: 'Embodies', in: 'Embodied by' },
  serves: { out: 'Serves', in: 'Served by' }, depends_on: { out: 'Depends on', in: 'Depended on by' },
}

const root = document.documentElement
const cvarv = (n: string) => getComputedStyle(root).getPropertyValue(n).trim()
const theme = () => (root.classList.contains('dark') ? 'dark' : 'light') // DLS drives dark via the .dark class
const nodeColor = (t: string) => { const m = TYPES[t] || { light: '#888', dark: '#888' }; return theme() === 'dark' ? m.dark : m.light }
const el = (tag: string, cls?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; return e }
// Paint a legend/chip swatch so it matches how the node renders on the canvas:
// ring types (Rule) are a hollow ring (transparent + coloured border), everything
// else is a solid fill. Keeps the key and the graph in sync.
const paintSwatch = (dot: any, t: string) => {
  const m = TYPES[t] || {}
  if (m.ring) { dot.style.background = 'transparent'; dot.style.border = '2px solid ' + nodeColor(t) }
  else { dot.style.background = m.semantic ? cvarv('--ok') : nodeColor(t); dot.style.border = '0' }
}

const nodes = GRAPH.nodes.map((n: any) => ({ ...n }))
const byId = new Map(nodes.map((n: any) => [n.id, n]))
const edges = GRAPH.edges.filter((e: any) => byId.has(e.source) && byId.has(e.target))
  .map((e: any) => ({ ...e, s: byId.get(e.source), t: byId.get(e.target) }))
const deg = new Map(); nodes.forEach((n: any) => deg.set(n.id, 0))
edges.forEach((e: any) => { deg.set(e.source, deg.get(e.source) + 1); deg.set(e.target, deg.get(e.target) + 1) })
nodes.forEach((n: any) => { n.r = 4 + Math.sqrt(deg.get(n.id)) * 1.7; n.deg = deg.get(n.id) })
const adj = new Map(nodes.map((n: any) => [n.id, new Set()]))
edges.forEach((e: any) => { adj.get(e.source).add(e.target); adj.get(e.target).add(e.source) })

let W = innerWidth, H = innerHeight
nodes.forEach((n: any, i: number) => { const a = (i / nodes.length) * Math.PI * 2; n.x = Math.cos(a) * 260 + (Math.random() - 0.5) * 40; n.y = Math.sin(a) * 260 + (Math.random() - 0.5) * 40; n.vx = 0; n.vy = 0 })

let alpha = 1
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches
let dragNode: any = null
function tick() {
  const rep = 2200, spring = 0.02, link = 46, grav = 0.015
  for (let i = 0; i < nodes.length; i++) { const a = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) { const b = nodes[j]
      const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || 0.01; if (d2 > 90000) continue
      const d = Math.sqrt(d2), f = rep / d2, fx = dx / d * f, fy = dy / d * f
      a.vx += fx * alpha; a.vy += fy * alpha; b.vx -= fx * alpha; b.vy -= fy * alpha
    }
    a.vx -= a.x * grav * alpha; a.vy -= a.y * grav * alpha
  }
  edges.forEach((e: any) => { const dx = e.t.x - e.s.x, dy = e.t.y - e.s.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, f = (d - link) * spring, fx = dx / d * f, fy = dy / d * f
    e.s.vx += fx * alpha; e.s.vy += fy * alpha; e.t.vx -= fx * alpha; e.t.vy -= fy * alpha })
  nodes.forEach((n: any) => { if (n === dragNode) return; n.vx *= 0.85; n.vy *= 0.85; n.x += n.vx; n.y += n.vy })
  alpha *= 0.994; if (alpha < 0.03) alpha = 0.03
}

let scale = 1, ox = 0, oy = 0
const cv = document.getElementById('c') as HTMLCanvasElement, ctx = cv.getContext('2d')!
const DPR = Math.min(devicePixelRatio || 1, 2)
function resize() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR }
addEventListener('resize', resize)

let selected: any = null, hover: any = null
const hidden = new Set<string>()
const screenX = (x: number) => x * scale + W / 2 + ox
const screenY = (y: number) => y * scale + H / 2 + oy
const worldX = (sx: number) => (sx - W / 2 - ox) / scale
const worldY = (sy: number) => (sy - H / 2 - oy) / scale

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H)
  const neigh = selected ? adj.get(selected.id) : null
  ctx.lineWidth = 1
  edges.forEach((e: any) => {
    if (hidden.has(e.s.type) || hidden.has(e.t.type)) return
    const on = selected && (e.source === selected.id || e.target === selected.id)
    ctx.globalAlpha = selected ? (on ? 0.9 : 0.06) : 0.35
    ctx.strokeStyle = on ? cvarv('--edge-hi') : cvarv('--edge')
    const sx = screenX(e.s.x), sy = screenY(e.s.y), tx = screenX(e.t.x), ty = screenY(e.t.y)
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty); ctx.stroke()
    // Direction: draw an arrowhead near the TARGET end. The edge reads source → target
    // = "user → used", so the arrow always points at the thing being used. On a selected
    // node: arrows pointing OUT of it = what it uses; arrows pointing INTO it = who uses it.
    if (on) {
      const ang = Math.atan2(ty - sy, tx - sx)
      const tr = e.t.r * Math.min(scale, 1.4) + 2.5           // sit just outside the target node
      const ax = tx - Math.cos(ang) * tr, ay = ty - Math.sin(ang) * tr
      const h = 7, w = 0.42
      ctx.fillStyle = cvarv('--edge-hi')
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ax - Math.cos(ang - w) * h, ay - Math.sin(ang - w) * h)
      ctx.lineTo(ax - Math.cos(ang + w) * h, ay - Math.sin(ang + w) * h)
      ctx.closePath(); ctx.fill()
    }
  })
  ctx.globalAlpha = 1
  nodes.forEach((n: any) => {
    if (hidden.has(n.type)) return
    const px = screenX(n.x), py = screenY(n.y), r = n.r * Math.min(scale, 1.4)
    const dim = selected && n !== selected && !(neigh && neigh.has(n.id))
    ctx.globalAlpha = dim ? 0.15 : 1
    const meta = TYPES[n.type] || {}
    ctx.beginPath(); ctx.arc(px, py, r, 0, 7)
    if (meta.semantic) ctx.fillStyle = n.passes === false ? cvarv('--bad') : cvarv('--ok')
    else ctx.fillStyle = nodeColor(n.type)
    if (meta.ring) ctx.fillStyle = cvarv('--bg')
    ctx.fill()
    ctx.lineWidth = n === selected ? 2.5 : 1.2
    ctx.strokeStyle = n === selected ? cvarv('--sel') : (meta.ring ? nodeColor(n.type) : cvarv('--node-stroke'))
    ctx.stroke()
    if (!dim && (n === selected || n === hover || (neigh && neigh.has(n.id)) || n.deg >= 14)) {
      ctx.fillStyle = cvarv('--ink'); ctx.font = (n === selected ? '600 12px' : '500 10.5px') + ' "Inter Variable",Inter,system-ui,sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(n.label, px, py - r - 5)
    }
  })
  ctx.globalAlpha = 1
}
function loop() { if (!reduced) { tick(); tick() } draw(); requestAnimationFrame(loop) }

function pick(sx: number, sy: number) { let best: any = null, bd = 1e9; nodes.forEach((n: any) => { if (hidden.has(n.type)) return
  const dx = screenX(n.x) - sx, dy = screenY(n.y) - sy, d = dx * dx + dy * dy, rr = Math.pow(n.r * Math.min(scale, 1.4) + 6, 2)
  if (d < rr && d < bd) { bd = d; best = n } }); return best }
let panning = false, px0 = 0, py0 = 0, moved = false
cv.addEventListener('mousedown', (e) => { const n = pick(e.offsetX, e.offsetY); moved = false
  if (n) dragNode = n; else { panning = true; cv.classList.add('drag') } px0 = e.offsetX; py0 = e.offsetY })
addEventListener('mousemove', (e) => {
  const rect = cv.getBoundingClientRect(), sx = e.clientX - rect.left, sy = e.clientY - rect.top
  if (dragNode) { dragNode.x = worldX(sx); dragNode.y = worldY(sy); dragNode.vx = dragNode.vy = 0; alpha = Math.max(alpha, 0.2); moved = true }
  else if (panning) { ox += sx - px0; oy += sy - py0; px0 = sx; py0 = sy; moved = true }
  else { hover = pick(sx, sy); const tip = document.getElementById('tip')!
    if (hover) { tip.style.opacity = '1'; tip.style.left = sx + 'px'; tip.style.top = sy + 'px'; tip.textContent = hover.label; cv.style.cursor = 'pointer' }
    else { tip.style.opacity = '0'; cv.style.cursor = '' } }
})
addEventListener('mouseup', () => { if (dragNode && !moved) select(dragNode); else if (panning && !moved) select(null); dragNode = null; panning = false; cv.classList.remove('drag') })
cv.addEventListener('wheel', (e) => { e.preventDefault(); const f = e.deltaY < 0 ? 1.12 : 0.89, rect = cv.getBoundingClientRect(),
  mx = e.clientX - rect.left - W / 2, my = e.clientY - rect.top - H / 2; ox = mx - (mx - ox) * f; oy = my - (my - oy) * f; scale = Math.max(0.2, Math.min(4, scale * f)) }, { passive: false })

function centerOn(n: any) { ox = -n.x * scale; oy = -n.y * scale }

function select(n: any) {
  selected = n
  // sync selection to the URL so a node is shareable / deep-linkable from the catalog
  history.replaceState(null, '', n ? '?node=' + encodeURIComponent(n.id) : location.pathname)
  const panel = document.getElementById('panel')!; panel.replaceChildren()
  if (!n) { panel.className = 'empty'; panel.textContent = 'Click any node to see its context — what it’s composed of, what uses it, what governs it.'; return }
  panel.className = ''
  const meta = TYPES[n.type] || {}
  const col = meta.semantic ? (n.passes === false ? cvarv('--bad') : cvarv('--ok')) : nodeColor(n.type)
  const trow = el('div', 'n-type'); const d0 = el('span', 'dot'); d0.style.background = col; trow.appendChild(d0); trow.appendChild(document.createTextNode(meta.label || n.type)); panel.appendChild(trow)
  const lab = el('div', 'n-label'); lab.textContent = n.label; panel.appendChild(lab)
  const m = el('div', 'n-meta')
  const chip = (txt: string, swatch?: string) => { const s = el('span'); if (swatch) { const sw = el('span', 'sw'); sw.style.background = swatch; s.appendChild(sw) } s.appendChild(document.createTextNode(txt)); m.appendChild(s) }
  if (n.hex) chip(n.hex, n.hex)
  if (n.value) chip(n.value)
  if (n.px) chip(n.px + 'px')
  if (n.apca_lc !== undefined) chip('APCA Lc ' + n.apca_lc + ' · WCAG ' + n.wcag_ratio + ':1 · ' + (n.passes ? 'pass' : 'fail'))
  if (n.path) chip(n.path)
  chip(n.deg + (n.deg === 1 ? ' connection' : ' connections'))
  panel.appendChild(m)
  // back-link to the live catalog for components (closes the app ↔ graph loop)
  if (n.type === 'component' || n.type === 'component-2one') {
    const a = el('a') as HTMLAnchorElement
    a.href = '/#index'; a.innerHTML = 'View in catalog ' + lucide('externalLink', 13)
    a.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:0 0 12px;font-family:var(--sans);font-size:12px;color:var(--ink-2);text-decoration:none;border:1px solid var(--line);border-radius:var(--r-pill);padding:6px 12px'
    panel.appendChild(a)
  }
  const groups: Record<string, any[]> = {}
  const outNames = new Set<string>()
  edges.forEach((e: any) => { if (e.source !== n.id && e.target !== n.id) return; const out = e.source === n.id, other = out ? e.t : e.s
    const name = (REL[e.type] || {})[out ? 'out' : 'in'] || e.type; if (out) outNames.add(name); (groups[name] = groups[name] || []).push(other) })
  if (Object.keys(groups).length) {
    const cap = el('div', 'rel-cap')
    cap.textContent = 'Arrowheads on the canvas point to whatever is being used. Each group below is tagged with an outward arrow (what this element uses) or an inward arrow (what uses it).'
    panel.appendChild(cap)
  }
  // Show outgoing (this element → others) first, then incoming — so "what it uses" and
  // "what uses it" never blur together. A direction tag makes each group unambiguous.
  Object.keys(groups).sort((a, b) => (outNames.has(b) ? 1 : 0) - (outNames.has(a) ? 1 : 0) || groups[b].length - groups[a].length).forEach((name) => {
    const isOut = outNames.has(name)
    const arr = groups[name]; const rel = el('div', 'rel'); const h = el('h4')
    const tag = el('span', 'dir ' + (isOut ? 'out' : 'in')); tag.innerHTML = lucide(isOut ? 'arrowRight' : 'arrowLeft', 12)
    tag.setAttribute('aria-label', isOut ? 'outgoing — this element uses these' : 'incoming — these use this element')
    tag.title = isOut ? 'this element → uses these' : 'these → use this element'
    h.appendChild(tag); h.appendChild(document.createTextNode(name))
    const cnt = el('span', 'cnt'); cnt.textContent = String(arr.length); h.appendChild(cnt); rel.appendChild(h)
    const ul = el('ul'); arr.forEach((o: any) => { const li = el('li'); li.textContent = o.label; li.addEventListener('click', () => { select(o); centerOn(o) }); ul.appendChild(li) })
    rel.appendChild(ul); panel.appendChild(rel)
  })
}

const chipsEl = document.getElementById('chips')!
const types = Array.from(new Set(nodes.map((n: any) => n.type))) as string[]
const chipByType = new Map<string, HTMLElement>()
const makeChip = (t: string) => {
  const meta = TYPES[t] || { label: t }; const chip = el('div', 'chip'); chip.dataset.t = t
  const dot = el('span', 'dot'); paintSwatch(dot, t)
  chip.appendChild(dot); chip.appendChild(document.createTextNode(meta.label || t))
  chip.addEventListener('click', () => { if (hidden.has(t)) { hidden.delete(t); chip.classList.remove('off') } else { hidden.add(t); chip.classList.add('off') } })
  chipByType.set(t, chip); return chip
}
// Group the type filters by family — same grouping as the Colors Inspiration legend
const chipFamilies: Record<string, string[]> = {}
types.forEach((t) => { const f = (TYPES[t] || {}).family || 'Other'; (chipFamilies[f] = chipFamilies[f] || []).push(t) })
FAMILY_ORDER.filter((f) => chipFamilies[f]).forEach((f) => {
  const grp = el('div', 'chip-fam'); const ft = el('div', 'chip-fam-title'); ft.textContent = f; grp.appendChild(ft)
  const row = el('div', 'chip-row')
  chipFamilies[f].sort((a, b) => (TYPES[a] ? TYPES[a].label : a).localeCompare(TYPES[b] ? TYPES[b].label : b)).forEach((t) => row.appendChild(makeChip(t)))
  grp.appendChild(row); chipsEl.appendChild(grp)
})

// Select all / Deselect all — toggle every type filter at once
document.getElementById('selall')!.addEventListener('click', () => {
  hidden.clear(); chipByType.forEach((chip) => chip.classList.remove('off'))
})
document.getElementById('deselall')!.addEventListener('click', () => {
  types.forEach((t) => hidden.add(t)); chipByType.forEach((chip) => chip.classList.add('off')); select(null)
})

// Collapsible rail panels (Selection, Inspiration) — click a header to fold/unfold
Array.prototype.forEach.call(document.querySelectorAll('.pnl-head'), (head: any) => {
  head.addEventListener('click', () => {
    const pnl = head.closest('.pnl'); const open = !pnl.classList.toggle('collapsed')
    head.setAttribute('aria-expanded', String(open))
  })
})

// Inspiration image lives at dev/assets/painting.avif — degrade gracefully if absent
const paintImg = document.getElementById('paint-img') as HTMLImageElement | null
const paintMissing = () => {
  const fig = document.getElementById('paint')!
  fig.classList.add('missing')
  fig.textContent = 'Add the painting at dev/assets/painting.avif to show it here.'
}
if (paintImg) {
  paintImg.addEventListener('error', paintMissing)
  // the error event may have already fired before this handler attached — catch that case
  if (paintImg.complete && paintImg.naturalWidth === 0) paintMissing()
}

// Build the Inspiration colour legend from the same TYPES map (single source of truth)
const guideLegend = document.getElementById('guide-legend')!
const families: Record<string, string[]> = {}
types.forEach((t) => { const f = (TYPES[t] || {}).family || 'Other'; (families[f] = families[f] || []).push(t) })
FAMILY_ORDER.filter((f) => families[f]).forEach((f) => {
  const grp = el('div', 'g-fam'); const ft = el('div', 'g-fam-title'); ft.textContent = f; grp.appendChild(ft)
  families[f].forEach((t) => {
    const meta = TYPES[t] || { label: t }; const row = el('div', 'g-row'); row.dataset.t = t
    const dot = el('span', 'g-dot'); paintSwatch(dot, t)
    const name = el('span', 'g-name'); name.textContent = meta.label || t
    row.appendChild(dot); row.appendChild(name)
    if (meta.src) { const s = el('span', 'g-src'); s.textContent = meta.src; row.appendChild(s) }
    grp.appendChild(row)
  })
  guideLegend.appendChild(grp)
})

document.getElementById('search')!.addEventListener('input', (e: any) => {
  const q = e.target.value.trim().toLowerCase(); if (!q) return
  const n = nodes.find((n: any) => n.label.toLowerCase().indexOf(q) >= 0)
  if (n) { select(n); centerOn(n); scale = Math.max(scale, 1) }
})
document.getElementById('reset')!.addEventListener('click', () => { scale = 1; ox = 0; oy = 0; select(null); alpha = 0.6 })

const tb = document.getElementById('theme')!
function setT(t: string) { root.classList.toggle('dark', t === 'dark'); tb.innerHTML = lucide(t === 'dark' ? 'moon' : 'sun')
  Array.prototype.forEach.call(document.querySelectorAll('.chip'), (c: any) => paintSwatch(c.querySelector('.dot'), c.dataset.t))
  Array.prototype.forEach.call(document.querySelectorAll('.g-row'), (row: any) => { const t2 = row.dataset.t; if (t2) paintSwatch(row.querySelector('.g-dot'), t2) })
  if (selected) select(selected) }
setT(matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
tb.addEventListener('click', () => setT(theme() === 'dark' ? 'light' : 'dark'))

document.getElementById('stats')!.textContent = GRAPH.stats.nodes + ' elements · ' + GRAPH.stats.edges + ' relationships'

// deep-link: /graph.html?node=<id> opens focused on that node (from the catalog)
const initId = new URLSearchParams(location.search).get('node')
if (initId && byId.has(initId)) { const n0 = byId.get(initId); select(n0); centerOn(n0); scale = Math.max(scale, 1.2); alpha = 0.5 }

resize(); loop()
