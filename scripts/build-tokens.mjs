/*
  Canonical token generator — the single source that all machine-readable token
  formats derive from (PRD FR-8: no format-specific drift).

  Reads the CSS tokens (tokens/*.css + src/styles/globals.css) and emits
  machine-readable JSON to tokens/*.json, including WCAG 2.x ratio + APCA Lc
  contrast data for every colour pair an AI/consumer needs (PRD NFR: contrast as
  structured data, not prose).

  Run:  npm run tokens
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

// ---- contrast maths ----
function h2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] }
function wcagRatio(a, b) {
  const L = (hex) => { const [r, g, bl] = h2rgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl }
  const l1 = L(a), l2 = L(b); const hi = Math.max(l1, l2), lo = Math.min(l1, l2)
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}
function apcaLc(txt, bg) {
  const Y = (hex) => { const f = (v) => Math.pow(v / 255, 2.4); const [r, g, b] = h2rgb(hex); return 0.2126729 * f(r) + 0.7151522 * f(g) + 0.0721750 * f(b) }
  let t = Y(txt), b = Y(bg); const bT = 0.022, bC = 1.414, dY = 0.0005, s = 1.14, lB = 0.027, lW = 0.027, lC = 0.1
  t = t > bT ? t : t + Math.pow(bT - t, bC); b = b > bT ? b : b + Math.pow(bT - b, bC)
  if (Math.abs(b - t) < dY) return 0
  let C; if (b > t) { const S = (Math.pow(b, 0.56) - Math.pow(t, 0.57)) * s; C = S < lC ? 0 : S - lB } else { const S = (Math.pow(b, 0.65) - Math.pow(t, 0.62)) * s; C = S > -lC ? 0 : S + lW }
  return Math.round(C * 1000) / 10
}

// ---- parse CSS var: value (hex or length) ----
const parseVars = (css, re = /(--[\w-]+):\s*([^;]+);/g) => { const o = {}; for (const m of css.matchAll(re)) o[m[1].trim()] = m[2].trim(); return o }

const colorsCss = read('tokens/colors.css')
const globals = read('src/styles/globals.css')
const typeCss = read('tokens/typography.css')
const spaceCss = read('tokens/spacing.css')

const ramps = parseVars(colorsCss)          // --color-neutral-50 … etc
const sem = parseVars(globals.split('@theme inline')[0]) // :root semantic hexes

const hexOnly = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => /^#[0-9a-fA-F]{6}$/.test(v)))

// ---- COLORS ----
const ramp = (prefix) => Object.fromEntries(Object.entries(hexOnly(ramps)).filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k.replace(prefix, ''), v.toLowerCase()]))
const bg = sem['--background'], fg = sem['--foreground']
const pair = (name, txt, bgc, usage, apcaMin) => ({ name, text: txt, background: bgc, usage, wcag_ratio: wcagRatio(txt, bgc), apca_lc: apcaLc(txt, bgc), apca_min: apcaMin, passes: Math.abs(apcaLc(txt, bgc)) >= apcaMin })

const colors = {
  $schema: '../schema/token.schema.json',
  description: '2one colour tokens. Grayscale system — no brand hue. danger/success are the only hues and are reserved for validation state only.',
  ramps: {
    neutral: ramp('--color-neutral-'),
    accent: ramp('--color-accent-'),
    danger: ramp('--color-danger-'),
    success: ramp('--color-success-'),
  },
  semantic: Object.fromEntries(Object.entries(hexOnly(sem)).map(([k, v]) => [k.replace('--', ''), v.toLowerCase()])),
  contrast: {
    standard: 'WCAG 2.x (ratio) + APCA / WCAG 3.0 draft (Lc). Layered: AA baseline, APCA as an additional perceptual check.',
    pairs: [
      pair('body-and-headings', fg, bg, 'body + headings on page', 75),
      pair('secondary-text', sem['--muted-foreground'], bg, 'secondary text / labels', 60),
      pair('primary-button-label', sem['--primary-foreground'], sem['--primary'], 'primary button label', 75),
      pair('destructive-button-label', sem['--destructive-foreground'], sem['--destructive'], 'destructive button label', 75),
      pair('error-text', sem['--destructive'], bg, 'error text / label', 60),
      pair('success-text', sem['--success'], bg, 'success text / label', 60),
      pair('border-nontext', sem['--border'], bg, 'border / input hairline (non-text UI)', 15),
      pair('focus-ring-nontext', sem['--ring'], bg, 'focus ring (non-text UI)', 15),
    ],
  },
  rules: [
    'Grayscale only — never introduce a brand hue.',
    'danger/success are for validation state only, never decoration.',
    'Never convey state by colour alone — pair with an icon or text.',
    'Any colour-token change must pass `npm run a11y`.',
  ],
}

// ---- TYPOGRAPHY ----
const tvars = parseVars(typeCss)
const px = (rem) => Math.round(parseFloat(rem) * 16)
const scaleKeys = ['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'base', 'sm', 'xs']
const typography = {
  $schema: '../schema/token.schema.json',
  fonts: {
    heading: (tvars['--font-heading'] || 'Satoshi').replace(/['"]/g, ''),
    body: (tvars['--font-sans'] || 'Inter').replace(/['"]/g, ''),
  },
  weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  scale: Object.fromEntries(scaleKeys.filter((k) => tvars[`--text-${k}`]).map((k) => [k, {
    size_rem: parseFloat(tvars[`--text-${k}`]),
    size_px: px(tvars[`--text-${k}`]),
    line_height_px: tvars[`--leading-${k}`] ? px(tvars[`--leading-${k}`]) : null,
    font: ['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(k) ? 'heading' : 'body',
  }])),
}

// ---- SPACING + RADIUS ----
const svars = parseVars(spaceCss)
const spacing = {
  $schema: '../schema/token.schema.json',
  spacing: Object.fromEntries(Object.entries(svars).filter(([k]) => k.startsWith('--spacing-')).map(([k, v]) => [k.replace('--spacing-', ''), v])),
  radius: Object.fromEntries(Object.entries(svars).filter(([k]) => k.startsWith('--radius-')).map(([k, v]) => [k.replace('--radius-', ''), v])),
  shadow: Object.fromEntries(Object.entries(svars).filter(([k]) => k.startsWith('--shadow-')).map(([k, v]) => [k.replace('--shadow-', ''), v])),
  notes: 'Buttons use radius-full (the 2one signature). Everything else uses xs–2xl.',
}

const out = (p, obj) => { writeFileSync(join(root, p), JSON.stringify(obj, null, 2) + '\n'); console.log('  wrote', p) }
console.log('Generating canonical token JSON:')
out('tokens/colors.json', colors)
out('tokens/typography.json', typography)
out('tokens/spacing.json', spacing)
console.log('Done.')
