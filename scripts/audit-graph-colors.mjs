/*
  APCA audit for the knowledge-graph explorer's OWN rendered colour pairs.

  The main `npm run a11y` audits the DLS grayscale tokens. The graph explorer adds
  one thing those tokens don't cover: the ukiyo-e node-dot palette (dev/graph-main.ts).
  This script audits every dot against the surface it is drawn on — the canvas ground
  (--background) and the panel/guide card (--card) — in BOTH themes, so "dark is not
  invert-and-ship" holds for the data-viz layer too.

  Node dots are non-text UI, so the bar is the APCA Lc 15 non-text floor (same as icons,
  borders, focus rings). Node LABELS render in --foreground and are covered by npm run a11y.

  Run:  node scripts/audit-graph-colors.mjs   (exits 1 if any pair is below the floor)
*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---- APCA-W3 0.1.9 (same reference as scripts/apca-audit.mjs) ----
function sRGBtoY([R, G, B]) { const f = (v) => Math.pow(v / 255, 2.4); return 0.2126729 * f(R) + 0.7151522 * f(G) + 0.0721750 * f(B) }
function h2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] }
function apca(txt, bg) {
  let t = sRGBtoY(h2rgb(txt)), b = sRGBtoY(h2rgb(bg))
  const bT = 0.022, bC = 1.414, dY = 0.0005, s = 1.14, lB = 0.027, lW = 0.027, lC = 0.1, nBG = 0.56, nT = 0.57, rT = 0.62, rB = 0.65
  t = t > bT ? t : t + Math.pow(bT - t, bC)
  b = b > bT ? b : b + Math.pow(bT - b, bC)
  if (Math.abs(b - t) < dY) return 0
  let C
  if (b > t) { const S = (Math.pow(b, nBG) - Math.pow(t, nT)) * s; C = S < lC ? 0 : S - lB }
  else { const S = (Math.pow(b, rB) - Math.pow(t, rT)) * s; C = S > -lC ? 0 : S + lW }
  return Math.round(C * 1000) / 10
}

// ---- the node palette, parsed from the explorer (single source of truth) ----
const src = readFileSync(join(root, 'dev/graph-main.ts'), 'utf8')
const typesBody = src.slice(src.indexOf('const TYPES'), src.indexOf('const REL'))
const palette = []
for (const m of typesBody.matchAll(/'([\w-]+)':\s*\{([^}]*)\}/g)) {
  const [, id, body] = m
  const light = (body.match(/light:\s*'(#[0-9a-fA-F]{6})'/) || [])[1]
  const dark = (body.match(/dark:\s*'(#[0-9a-fA-F]{6})'/) || [])[1]
  const label = (body.match(/label:\s*'([^']*)'/) || [])[1] || id
  if (light && dark) palette.push({ id, label, light, dark })
}
if (!palette.length) { console.error('  ✗ could not parse the node palette from dev/graph-main.ts'); process.exit(1) }

// ---- the grounds the dots are drawn on, from the DLS theme (per theme scope) ----
const css = readFileSync(join(root, 'src/styles/globals.css'), 'utf8')
const block = (re) => { const m = css.match(re); return m ? m[1] : '' }
const tok = (body, name) => (body.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`)) || [])[1]
const lightBody = block(/:root\s*\{([\s\S]*?)\n\s*\}/)
const darkBody = block(/\.dark\s*\{([\s\S]*?)\n\s*\}/)
const grounds = {
  light: { background: tok(lightBody, '--background'), card: tok(lightBody, '--card') },
  dark: { background: tok(darkBody, '--background'), card: tok(darkBody, '--card') },
}

const FLOOR = 15 // non-text UI (dots) — APCA Lc absolute
let failed = 0
for (const themeName of ['light', 'dark']) {
  const g = grounds[themeName]
  console.log(`\n  Graph node-dot APCA — ${themeName}  (ground ${g.background} · card ${g.card})\n`)
  console.log('    canvas   card    dot')
  console.log('  ' + '-'.repeat(60))
  for (const p of palette) {
    const hex = p[themeName]
    const onBg = Math.abs(apca(hex, g.background))
    const onCard = Math.abs(apca(hex, g.card))
    const ok = onBg >= FLOOR && onCard >= FLOOR
    if (!ok) failed++
    const mark = (v) => `${v >= FLOOR ? ' ' : '!'}${String(v).padStart(5)}`
    console.log(`  ${mark(onBg)}  ${mark(onCard)}   ${ok ? '     ' : 'FAIL '} ${p.label} (${hex})`)
  }
}

console.log('')
if (failed) { console.error(`  ✗ ${failed} node colour(s) below the Lc ${FLOOR} non-text floor on a surface they render on\n`); process.exit(1) }
console.log(`  ✓ every node dot clears the Lc ${FLOOR} non-text floor on both the canvas and the card — light AND dark\n`)
