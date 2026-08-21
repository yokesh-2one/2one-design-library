// @ts-nocheck
// Knowledge-graph explorer, loaded as a Vite module (data imported directly).
import graph from '../graph.json'
const GRAPH = graph as any

const TYPES: Record<string, any> = {
  'brand': { label: 'Brand', light: '#09090b', dark: '#f4f4f5' },
  'component': { label: 'Component', light: '#27272a', dark: '#e4e4e7' },
  'component-2one': { label: '2one-only', light: '#000000', dark: '#ffffff' },
  'token-color': { label: 'Colour token', light: '#52525b', dark: '#a1a1aa' },
  'ramp': { label: 'Ramp step', light: '#a1a1aa', dark: '#71717a' },
  'token-radius': { label: 'Radius', light: '#6b6b73', dark: '#8a8a92' },
  'token-type': { label: 'Type', light: '#6b6b73', dark: '#8a8a92' },
  'template-block': { label: 'Block', light: '#3f3f46', dark: '#c4c4cc' },
  'template-chart': { label: 'Chart', light: '#71717a', dark: '#9a9aa2' },
  'rule': { label: 'Rule', light: '#111113', dark: '#fafafa', ring: true },
  'contrast': { label: 'Contrast', light: '#15803d', dark: '#4ade80', semantic: true },
}
const REL: Record<string, any> = {
  composed_of: { out: 'Composed of', in: 'Used by' }, uses: { out: 'Uses', in: 'Used by' },
  derived_from: { out: 'Derived from', in: 'Source of' }, governed_by: { out: 'Governed by', in: 'Governs' },
  has_contrast: { out: 'Contrast', in: 'Contrast of' }, embodies: { out: 'Embodies', in: 'Embodied by' },
  serves: { out: 'Serves', in: 'Served by' },
}

const root = document.documentElement
const cvarv = (n: string) => getComputedStyle(root).getPropertyValue(n).trim()
const theme = () => root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
const nodeColor = (t: string) => { const m = TYPES[t] || { light: '#888', dark: '#888' }; return theme() === 'dark' ? m.dark : m.light }
const el = (tag: string, cls?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; return e }

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
    ctx.beginPath(); ctx.moveTo(screenX(e.s.x), screenY(e.s.y)); ctx.lineTo(screenX(e.t.x), screenY(e.t.y)); ctx.stroke()
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
      ctx.fillStyle = cvarv('--ink'); ctx.font = (n === selected ? 12 : 10.5) + 'px ui-monospace,monospace'; ctx.textAlign = 'center'
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
  if (!n) { panel.className = 'empty'; panel.textContent = 'Select a node to see its context: what it is composed of, what uses it, and what governs it.'; return }
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
    a.href = '/#index'; a.textContent = 'View in catalog ↗'
    a.style.cssText = 'display:inline-block;margin:0 0 12px;font-family:var(--mono);font-size:11.5px;color:var(--ink-2);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:6px 10px'
    panel.appendChild(a)
  }
  const groups: Record<string, any[]> = {}
  edges.forEach((e: any) => { if (e.source !== n.id && e.target !== n.id) return; const out = e.source === n.id, other = out ? e.t : e.s
    const name = (REL[e.type] || {})[out ? 'out' : 'in'] || e.type; (groups[name] = groups[name] || []).push(other) })
  Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length).forEach((name) => {
    const arr = groups[name]; const rel = el('div', 'rel'); const h = el('h4'); h.appendChild(document.createTextNode(name))
    const cnt = el('span'); cnt.textContent = String(arr.length); h.appendChild(cnt); rel.appendChild(h)
    const ul = el('ul'); arr.forEach((o: any) => { const li = el('li'); li.textContent = o.label; li.addEventListener('click', () => { select(o); centerOn(o) }); ul.appendChild(li) })
    rel.appendChild(ul); panel.appendChild(rel)
  })
}

const chipsEl = document.getElementById('chips')!
const types = Array.from(new Set(nodes.map((n: any) => n.type))) as string[]
types.sort((a, b) => (TYPES[a] ? TYPES[a].label : a).localeCompare(TYPES[b] ? TYPES[b].label : b)).forEach((t) => {
  const meta = TYPES[t] || { label: t }; const chip = el('div', 'chip'); chip.dataset.t = t
  const dot = el('span', 'dot'); dot.style.background = meta.semantic ? cvarv('--ok') : nodeColor(t)
  chip.appendChild(dot); chip.appendChild(document.createTextNode(meta.label || t))
  chip.addEventListener('click', () => { if (hidden.has(t)) { hidden.delete(t); chip.classList.remove('off') } else { hidden.add(t); chip.classList.add('off') } })
  chipsEl.appendChild(chip)
})

document.getElementById('search')!.addEventListener('input', (e: any) => {
  const q = e.target.value.trim().toLowerCase(); if (!q) return
  const n = nodes.find((n: any) => n.label.toLowerCase().indexOf(q) >= 0)
  if (n) { select(n); centerOn(n); scale = Math.max(scale, 1) }
})
document.getElementById('reset')!.addEventListener('click', () => { scale = 1; ox = 0; oy = 0; select(null); alpha = 0.6 })

const tb = document.getElementById('theme')!
function setT(t: string) { root.setAttribute('data-theme', t); tb.textContent = t === 'dark' ? '☾' : '☀'
  Array.prototype.forEach.call(document.querySelectorAll('.chip'), (c: any) => { const m = TYPES[c.dataset.t] || {}; c.querySelector('.dot').style.background = m.semantic ? cvarv('--ok') : nodeColor(c.dataset.t) })
  if (selected) select(selected) }
setT(matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
tb.addEventListener('click', () => setT(theme() === 'dark' ? 'light' : 'dark'))

document.getElementById('stats')!.textContent = GRAPH.stats.nodes + ' elements · ' + GRAPH.stats.edges + ' relationships'

// deep-link: /graph.html?node=<id> opens focused on that node (from the catalog)
const initId = new URLSearchParams(location.search).get('node')
if (initId && byId.has(initId)) { const n0 = byId.get(initId); select(n0); centerOn(n0); scale = Math.max(scale, 1.2); alpha = 0.5 }

resize(); loop()
