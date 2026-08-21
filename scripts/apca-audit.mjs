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

import { config as cfg } from './lib/config.mjs'

const root = cfg.root

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

// ---- read the live token values from globals.css, per theme scope ----
// The :root block is the light theme; the .dark block redefines the same
// semantic vars for dark. We parse each block separately so dark values never
// clobber light ones — BOTH themes must clear their thresholds.
const css = readFileSync(join(root, 'src/styles/globals.css'), 'utf8')
const blockBody = (selectorRe) => { const m = css.match(selectorRe); return m ? m[1] : '' }
const parseTokens = (body) => {
  const t = {}
  for (const m of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) t[m[1]] = m[2].toLowerCase()
  return t
}
const themes = {
  light: parseTokens(blockBody(/:root\s*\{([^}]*)\}/)),
  dark: parseTokens(blockBody(/\.dark\s*\{([^}]*)\}/)),
}

// ---- pairs to check: [textVar, bgVar, usage, requiredLc] ----
// Audit the pairs the COMPONENTS ACTUALLY RENDER, on every surface — not a
// handful of idealised token pairs. A token-only check passed while the dark
// destructive button rendered white-on-pale-pink (Lc 24); this matrix covers
// text on each surface, muted text on each surface, error text on cards, and
// non-text (borders/rings) on each surface they sit on.
const pairs = [
  // primary text on each surface it lands on
  ['--foreground', '--background', 'body text on page', 75],
  ['--card-foreground', '--card', 'text on a Card', 75],
  ['--popover-foreground', '--popover', 'text in a menu / popover', 75],
  ['--primary-foreground', '--primary', 'primary button label', 75],
  ['--secondary-foreground', '--secondary', 'secondary button label', 75],
  ['--accent-foreground', '--accent', 'hover / active menu item', 60],
  // secondary (muted) text on each surface it lands on
  ['--muted-foreground', '--background', 'secondary text on page', 60],
  ['--muted-foreground', '--card', 'CardDescription / muted text on a Card', 60],
  ['--muted-foreground', '--popover', 'muted text in a menu', 60],
  ['--muted-foreground', '--muted', 'muted text on a muted fill', 60],
  // validation — components render text-destructive-foreground on SOLID --destructive
  ['--destructive-foreground', '--destructive', 'destructive button / badge label', 75],
  ['--destructive', '--background', 'error text on page', 60],
  ['--destructive', '--card', 'error text on a Card (Alert)', 60],
  ['--success', '--background', 'success text on page', 60],
  ['--success', '--card', 'success text on a Card', 60],
  // non-text UI (borders, rings) on each surface they sit on
  ['--border', '--background', 'border / input hairline on page', 15],
  ['--border', '--card', 'card & table hairlines on a Card', 15],
  ['--ring', '--background', 'focus ring on page', 15],
  ['--ring', '--card', 'focus ring on a Card / input', 15],
  // sidebar surface
  ['--sidebar-foreground', '--sidebar', 'sidebar text', 75],
  ['--muted-foreground', '--sidebar', 'sidebar label / muted text', 60],
  ['--sidebar-accent-foreground', '--sidebar-accent', 'active nav item', 60],
  ['--sidebar-primary-foreground', '--sidebar-primary', 'sidebar primary label', 75],
  ['--sidebar-border', '--sidebar', 'sidebar border', 15],
]

function auditTheme(label, tok) {
  const v = (name) => { if (!tok[name]) throw new Error(`token ${name} not found in .${label === 'light' ? 'root' : label} block of globals.css`); return tok[name] }
  let failed = 0
  console.log(`\n  APCA audit — 2one DLS theme (${label})\n`)
  console.log('   Lc    req   result  pair')
  console.log('  ' + '-'.repeat(70))
  for (const [tv, bv, usage, req] of pairs) {
    const lc = apca(v(tv), v(bv))
    const pass = Math.abs(lc) >= req
    if (!pass) failed++
    console.log(`  ${String(lc).padStart(6)}   ${String(req).padStart(3)}   ${pass ? ' pass ' : ' FAIL '}  ${usage}  (${tv} on ${bv})`)
  }
  return failed
}

let failed = auditTheme('light', themes.light)
if (Object.keys(themes.dark).length) failed += auditTheme('dark', themes.dark)
else { console.error('\n  ✗ no .dark theme block found in globals.css — dark theme must be contrast-audited\n'); process.exit(1) }

console.log('')
if (failed) { console.error(`  ✗ ${failed} pair(s) below threshold across themes\n`); process.exit(1) }
console.log('  ✓ all pairs meet their APCA threshold — light AND dark\n')
