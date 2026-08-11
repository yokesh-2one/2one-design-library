/*
  APCA contrast audit for the 2one DLS theme.
  Parses the semantic tokens from src/styles/globals.css and checks the key
  text / non-text pairs against APCA (WCAG 3.0 draft) Lc thresholds. Layer this
  ON TOP of WCAG 2.x AA — it is an additional check, not a replacement.

  Run:  npm run a11y      (exits 1 if any pair fails)

  Thresholds (perceptual Lc, absolute value; polarity is handled by the formula):
    90  large bold headings / colour blocks (soft ceiling)
    75  body text minimum
    60  labels / captions
    45  large or heavy headings only
    30  floor — placeholder / disabled text
    15  floor — non-text UI (icons, borders, focus rings)
*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---- APCA-W3 0.1.9 reference ----
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

// ---- read the live token values from globals.css ----
const css = readFileSync(join(root, 'src/styles/globals.css'), 'utf8')
const tok = {}
for (const m of css.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) tok[m[1]] = m[2].toLowerCase()
const v = (name) => { if (!tok[name]) throw new Error(`token ${name} not found in globals.css`); return tok[name] }

// ---- pairs to check: [textVar, bgVar, usage, requiredLc] ----
const pairs = [
  ['--foreground', '--background', 'body + headings on page', 75],
  ['--muted-foreground', '--background', 'secondary text / labels', 60],
  ['--muted-foreground', '--muted', 'muted text on muted surface', 60],
  ['--primary-foreground', '--primary', 'primary button label', 75],
  ['--secondary-foreground', '--secondary', 'secondary button label', 75],
  ['--destructive-foreground', '--destructive', 'destructive button label', 75],
  ['--destructive', '--background', 'error text / label', 60],
  ['--success', '--background', 'success text / label', 60],
  ['--border', '--background', 'border / input hairline (non-text)', 15],
  ['--ring', '--background', 'focus ring (non-text)', 15],
]

let failed = 0
console.log('\n  APCA audit — 2one DLS theme (light)\n')
console.log('   Lc    req   result  pair')
console.log('  ' + '-'.repeat(70))
for (const [tv, bv, usage, req] of pairs) {
  const lc = apca(v(tv), v(bv))
  const pass = Math.abs(lc) >= req
  if (!pass) failed++
  const lcs = String(lc).padStart(6)
  console.log(`  ${lcs}   ${String(req).padStart(3)}   ${pass ? ' pass ' : ' FAIL '}  ${usage}  (${tv} on ${bv})`)
}
console.log('')
if (failed) { console.error(`  ✗ ${failed} pair(s) below threshold\n`); process.exit(1) }
console.log('  ✓ all pairs meet their APCA threshold\n')
