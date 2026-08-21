/*
  Brand colour generator for the 2one DLS.

  The system is grayscale by default; a consumer brand is carried by a single
  seed colour. This tool turns ONE seed hex into a paste-ready theme override:
  a tonal ramp (--color-brand-50…950) plus the shadcn primary variables for
  BOTH light and dark, with each label colour picked by APCA. It then audits
  every generated text pair and EXITS 1 if any label can't clear its threshold —
  so an on-brand-but-unreadable colour fails the build instead of shipping.
  (The live playground in dev/showcase.tsx previews only the single light pair;
  this is the buildable, both-themes, pass/fail version.)

  Run:  node scripts/build-brand.mjs "#0057ff"
        npm run brand -- "#0057ff"
*/
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---- APCA-W3 0.1.9 reference (identical maths to scripts/apca-audit.mjs) ----
function sRGBtoY([R, G, B]) { const f = (v) => Math.pow(v / 255, 2.4); return 0.2126729 * f(R) + 0.7151522 * f(G) + 0.0721750 * f(B) }
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

// ---- colour utils ----
function h2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] }
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
const rgb2h = ([r, g, b]) => '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)   // sRGB linear interpolation, t in [0,1]
const normalise = (hex) => rgb2h(h2rgb(hex))                    // validates + canonicalises

const WHITE = [255, 255, 255], BLACK = [0, 0, 0]
const NEAR_BLACK = '#09090b'   // the system's foreground ink (neutral-950)
const NEAR_WHITE = '#fafafa'   // the system's inverted ink (neutral-50)

// Tonal ramp: 500 = the seed; lighter steps mix toward white, darker toward black.
const RAMP = [
  ['50', WHITE, 0.95], ['100', WHITE, 0.88], ['200', WHITE, 0.74], ['300', WHITE, 0.56], ['400', WHITE, 0.30],
  ['500', null, 0],
  ['600', BLACK, 0.18], ['700', BLACK, 0.34], ['800', BLACK, 0.50], ['900', BLACK, 0.66], ['950', BLACK, 0.76],
]
function buildRamp(seed) {
  const s = h2rgb(seed)
  const out = {}
  for (const [step, toward, t] of RAMP) out[step] = toward ? rgb2h(mix(s, toward, t)) : normalise(seed)
  return out
}

// Best label ink for a fill: whichever of near-white / near-black has the stronger |Lc|.
const bestInk = (bg) => (Math.abs(apca(NEAR_WHITE, bg)) >= Math.abs(apca(NEAR_BLACK, bg)) ? NEAR_WHITE : NEAR_BLACK)

// Pick the primary fill for a theme: first candidate ramp step whose label clears Lc 75.
function pickPrimary(ramp, order) {
  for (const step of order) {
    const bg = ramp[step], ink = bestInk(bg)
    if (Math.abs(apca(ink, bg)) >= 75) return { step, bg, ink, lc: apca(ink, bg), ok: true }
  }
  // nothing cleared — return the best available so we can report the shortfall
  const best = order.map((step) => { const bg = ramp[step], ink = bestInk(bg); return { step, bg, ink, lc: apca(ink, bg) } })
    .sort((a, b) => Math.abs(b.lc) - Math.abs(a.lc))[0]
  return { ...best, ok: false }
}

// ---- run ----
const arg = process.argv[2]
if (!arg || !/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(arg)) {
  console.error('\n  Usage: node scripts/build-brand.mjs "#0057ff"\n         (a 3- or 6-digit hex colour)\n')
  process.exit(2)
}
const seed = normalise(arg)
const ramp = buildRamp(seed)

// Light theme prefers the seed itself, then progressively darker steps; dark
// theme prefers a lighter step so the pill reads on the dark ground.
const light = pickPrimary(ramp, ['500', '600', '700', '800', '950'])
const dark = pickPrimary(ramp, ['400', '300', '500', '200'])

// Report the seed used as text on each ground too (link / text-primary use), Lc 60 for text.
const seedTextLight = apca(light.bg, '#ffffff')
const seedTextDark = apca(dark.bg, '#09090b')

console.log(`\n  2one DLS — brand generator\n  seed: ${seed}\n`)
console.log('  tonal ramp (--color-brand-*):')
console.log('   ' + Object.entries(ramp).map(([k, v]) => `${k}:${v}`).join('  '))
console.log('\n   theme  primary(step)   label      Lc    req   result')
console.log('  ' + '-'.repeat(58))
const row = (name, p) => console.log(`  ${name.padEnd(6)} ${(p.bg + ' (' + p.step + ')').padEnd(15)} ${p.ink}   ${String(p.lc).padStart(6)}   75    ${p.ok ? ' pass ' : ' FAIL '}`)
row('light', light)
row('dark', dark)
console.log(`\n  primary as text: light ${seedTextLight} on #ffffff · dark ${seedTextDark} on #09090b  (Lc 60 = readable body/link text)`)

// In light theme the seed (step 500) is the natural button fill. If it can't
// carry a label we substitute a nearby step — flag it, because the rendered
// button colour then differs from the colour that was chosen.
if (light.ok && light.step !== '500') {
  console.log(`\n  ⚠ the seed ${seed} can't carry a readable button label, so the light`)
  console.log(`    button uses ${light.bg} (brand-${light.step}) instead. Use the seed itself`)
  console.log(`    for accents / text where it passes, and this darker step for filled buttons.`)
}

// ---- emit a paste-ready CSS override + the ramp as JSON ----
const css = `/* Generated by scripts/build-brand.mjs — seed ${seed}.
   Paste over the primary block in src/styles/globals.css, then run \`npm run a11y\`.
   The tonal ramp is exposed as --color-brand-* for accents / charts. */
:root {
${Object.entries(ramp).map(([k, v]) => `  --color-brand-${k}: ${v};`).join('\n')}

  --primary: ${light.bg};
  --primary-foreground: ${light.ink};
  --sidebar-primary: ${light.bg};
  --sidebar-primary-foreground: ${light.ink};
  --ring: ${light.bg};
}

.dark {
  --primary: ${dark.bg};
  --primary-foreground: ${dark.ink};
  --sidebar-primary: ${dark.bg};
  --sidebar-primary-foreground: ${dark.ink};
  --ring: ${dark.bg};
}
`
mkdirSync(join(root, 'dist'), { recursive: true })
const outCss = join(root, 'dist', 'brand.css')
const outJson = join(root, 'dist', 'brand.json')
writeFileSync(outCss, css)
writeFileSync(outJson, JSON.stringify({ seed, ramp, light, dark }, null, 2))
console.log(`\n  → wrote ${outCss}\n  → wrote ${outJson}`)

if (!light.ok || !dark.ok) {
  console.error(`\n  ✗ the ${!light.ok ? 'light' : ''}${!light.ok && !dark.ok ? ' and ' : ''}${!dark.ok ? 'dark' : ''} primary label cannot clear APCA Lc 75.`)
  console.error(`    Pick a seed with more headroom (a mid-tone hue), or use a brand ramp step as an accent only — not as a button fill.\n`)
  process.exit(1)
}
console.log('\n  ✓ both primary labels clear APCA Lc 75 — safe to apply.\n')
