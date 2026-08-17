/*
  APCA contrast audit for the 2one × Astryx theme — mirrors the 2one DLS audit
  (scripts/apca-audit.mjs there), adapted to Astryx's token names and its
  `light-dark(light, dark)` values, so it checks BOTH themes. Alpha tokens
  (e.g. --color-border #00000014) are composited over their surface first.

  Run:  npm run a11y     (exits 1 if any pair, in either theme, is below Lc)
*/
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(root, 'dist/theme-2one.css'), 'utf8')

// ---- APCA-W3 0.1.9 (identical to the DLS) ----
const clampA = (h) => h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
function rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] }
// composite a possibly-translucent fg hex over an opaque bg hex → opaque [r,g,b]
function over(fgHex, bgHex) { const a = clampA(fgHex.replace('#', '')), f = rgb(fgHex), b = rgb(bgHex); return f.map((c, i) => Math.round(c * a + b[i] * (1 - a))) }
function sRGBtoY([R, G, B]) { const f = (v) => Math.pow(v / 255, 2.4); return 0.2126729 * f(R) + 0.7151522 * f(G) + 0.0721750 * f(B) }
function apca(txtRGB, bgRGB) {
  let t = sRGBtoY(txtRGB), b = sRGBtoY(bgRGB)
  const bT = 0.022, bC = 1.414, dY = 0.0005, s = 1.14, lB = 0.027, lW = 0.027, lC = 0.1, nBG = 0.56, nT = 0.57, rT = 0.62, rB = 0.65
  t = t > bT ? t : t + Math.pow(bT - t, bC); b = b > bT ? b : b + Math.pow(bT - b, bC)
  if (Math.abs(b - t) < dY) return 0
  let C
  if (b > t) { const S = (Math.pow(b, nBG) - Math.pow(t, nT)) * s; C = S < lC ? 0 : S - lB }
  else { const S = (Math.pow(b, rB) - Math.pow(t, rT)) * s; C = S > -lC ? 0 : S + lW }
  return Math.round(C * 1000) / 10
}

// ---- resolve a token's value per theme, from its FIRST (root) definition ----
function tokenValue(name, theme) {
  const ld = css.match(new RegExp(name + ':\\s*light-dark\\(\\s*(#[0-9a-fA-F]{6,8})\\s*,\\s*(#[0-9a-fA-F]{6,8})\\s*\\)'))
  if (ld) return theme === 'light' ? ld[1] : ld[2]
  const single = css.match(new RegExp(name + ':\\s*(#[0-9a-fA-F]{6,8})\\s*;'))
  if (single) return single[1]
  throw new Error(`token ${name} not found (literal) in theme-2one.css`)
}
// effective opaque color of `text` on `bg` (composites alpha over bg)
const eff = (name, bgName, theme) => over(tokenValue(name, theme), tokenValue(bgName, theme))
const opaque = (name, theme) => over(tokenValue(name, theme), tokenValue('--color-background-body', theme))

// ---- pairs: [textVar, bgVar, usage, requiredLc] ----
const pairs = [
  ['--color-text-primary', '--color-background-body', 'body text on the canvas', 75],
  ['--color-text-primary', '--color-background-card', 'text on a card', 75],
  ['--color-text-secondary', '--color-background-body', 'secondary text on canvas', 60],
  ['--color-text-secondary', '--color-background-card', 'secondary text on a card', 60],
  ['--color-on-accent', '--color-accent', 'primary button label', 75],
  ['--color-on-error', '--color-error', 'destructive button label', 75],
  ['--color-on-success', '--color-success', 'success button label', 75],
  ['--color-error', '--color-background-body', 'error text on canvas', 60],
  ['--color-success', '--color-background-body', 'success text on canvas', 60],
  ['--color-icon-secondary', '--color-background-body', 'secondary icon (non-text)', 45],
  ['--color-border', '--color-background-body', 'border on canvas (non-text)', 15],
  ['--color-border', '--color-background-card', 'border on a card (non-text)', 15],
  ['--color-border', '--color-background-surface', 'border on a lifted surface (non-text)', 15],
]

function auditTheme(theme) {
  let failed = 0
  console.log(`\n  APCA audit — 2one × Astryx theme (${theme})\n`)
  console.log('   Lc    req   result  pair')
  console.log('  ' + '-'.repeat(72))
  for (const [tv, bv, usage, req] of pairs) {
    const lc = apca(over(tokenValue(tv, theme), tokenValue(bv, theme)), over(tokenValue(bv, theme), tokenValue(bv, theme)))
    const pass = Math.abs(lc) >= req
    if (!pass) failed++
    console.log(`  ${String(lc).padStart(6)}   ${String(req).padStart(3)}   ${pass ? ' pass ' : ' FAIL '}  ${usage}  (${tv} on ${bv})`)
  }
  return failed
}

let failed = auditTheme('light') + auditTheme('dark')
console.log('')
if (failed) { console.error(`  ✗ ${failed} pair(s) below threshold across light + dark\n`); process.exit(1) }
console.log('  ✓ all pairs meet their APCA threshold — light AND dark\n')
