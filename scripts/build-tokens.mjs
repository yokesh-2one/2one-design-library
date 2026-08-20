/*
  Canonical token generator — the single source that all machine-readable token
  formats derive from (PRD FR-8: no format-specific drift).

  Reads the CSS tokens (tokens/*.css + src/styles/globals.css) and emits
  machine-readable JSON to tokens/*.json, including WCAG 2.x ratio + APCA Lc
  contrast data for every colour pair an AI/consumer needs (PRD NFR: contrast as
  structured data, not prose).

  Run:  npm run tokens
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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
// Only the :root (light) block is the canonical semantic set. Parse it alone —
// the .dark block redefines the same vars, so a whole-file parse would let dark
// values clobber the canonical light tokens (and the Canva brand kit).
const rootBlock = (globals.match(/:root\s*\{([^}]*)\}/) || ['', ''])[1]
const sem = parseVars(rootBlock)

// The dark set, parsed separately for the same reason: merged, the two would
// clobber each other. Emitted alongside rather than instead of the light set —
// `semantic` has four consumers (build-manifest, build-graph, check-usage,
// validate) and renaming it would break them silently.
const darkBlock = (globals.match(/\.dark\s*\{([^}]*)\}/) || ['', ''])[1]
const semDark = parseVars(darkBlock)

const hexOnly = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => /^#[0-9a-fA-F]{6}$/.test(v)))

// ---- COLORS ----
const ramp = (prefix) => Object.fromEntries(Object.entries(hexOnly(ramps)).filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k.replace(prefix, ''), v.toLowerCase()]))
const bg = sem['--background'], fg = sem['--foreground']
const pair = (theme, name, txt, bgc, usage, apcaMin) => ({ theme, name, text: txt, background: bgc, usage, wcag_ratio: wcagRatio(txt, bgc), apca_lc: apcaLc(txt, bgc), apca_min: apcaMin, passes: Math.abs(apcaLc(txt, bgc)) >= apcaMin })

// The same eight pairs computed per theme. Previously only light was emitted
// and the pairs carried no `theme` field, so a reader could not tell which
// palette an Lc reading belonged to in a system that ships two.
const pairsFor = (theme, s) => [
  pair(theme, 'body-and-headings', s['--foreground'], s['--background'], 'body + headings on page', 75),
  pair(theme, 'secondary-text', s['--muted-foreground'], s['--background'], 'secondary text / labels', 60),
  pair(theme, 'primary-button-label', s['--primary-foreground'], s['--primary'], 'primary button label', 75),
  pair(theme, 'destructive-button-label', s['--destructive-foreground'], s['--destructive'], 'destructive button label', 75),
  pair(theme, 'error-text', s['--destructive'], s['--background'], 'error text / label', 60),
  pair(theme, 'success-text', s['--success'], s['--background'], 'success text / label', 60),
  pair(theme, 'border-nontext', s['--border'], s['--background'], 'border / input hairline (non-text UI)', 15),
  pair(theme, 'focus-ring-nontext', s['--ring'], s['--background'], 'focus ring (non-text UI)', 15),
]

const colors = {
  $schema: '../schema/token.schema.json',
  description: '2one colour tokens. Grayscale system — no brand hue. danger/success are the only hues and are reserved for validation state only. TWO THEMES: `semantic` is the light set, `semantic_dark` the dark one; always say which theme a value belongs to. Contrast pairs cover both and carry a `theme` field.',
  ramps: {
    neutral: ramp('--color-neutral-'),
    accent: ramp('--color-accent-'),
    danger: ramp('--color-danger-'),
    success: ramp('--color-success-'),
  },
  themes: ['light', 'dark'],
  /* `semantic` is the LIGHT set — kept under that name because four scripts read
     it. Dark is a sibling, not a replacement. Always state which theme a value
     belongs to; quoting `semantic.border` as "the border colour" is wrong in a
     two-theme system. */
  semantic: Object.fromEntries(Object.entries(hexOnly(sem)).map(([k, v]) => [k.replace('--', ''), v.toLowerCase()])),
  semantic_dark: Object.fromEntries(Object.entries(hexOnly(semDark)).map(([k, v]) => [k.replace('--', ''), v.toLowerCase()])),
  contrast: {
    standard: 'WCAG 2.x (ratio) + APCA / WCAG 3.0 draft (Lc). Layered: AA baseline, APCA as an additional perceptual check.',
    note: 'Every pair carries a `theme`. Both themes are audited by `npm run a11y`, which is the authority — these values are the same maths, precomputed.',
    pairs: [...pairsFor('light', sem), ...pairsFor('dark', semDark)],
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

// ---- CANVA brand-kit export (derived from the tokens above; users' Canva
//      integration consumes this — same canonical source, no duplication) ----
const CANVA_RAW = 'https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/'
const s = colors.semantic
const canva = {
  name: '2one',
  source: 'Generated from tokens/colors.json + tokens/typography.json. Do not edit by hand — run `npm run tokens`.',
  raw_url: 'https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/integrations/canva/brand-kit.json',
  colors: [
    { name: 'Ink', hex: s.foreground }, { name: 'Primary', hex: s.primary },
    { name: 'Background', hex: s.background }, { name: 'Muted', hex: s.muted },
    { name: 'Secondary text', hex: s['muted-foreground'] }, { name: 'Border', hex: s.border },
    { name: 'Danger', hex: s.destructive }, { name: 'Success', hex: s.success },
  ].filter((c) => c.hex),
  neutral_ramp: Object.entries(colors.ramps.neutral).map(([step, hex]) => ({ name: `Neutral ${step}`, hex })),
  fonts: {
    heading: typography.fonts.heading.split(',')[0].replace(/['"]/g, '').trim(),
    body: typography.fonts.body.split(',')[0].replace(/['"]/g, '').trim(),
    note: 'Satoshi ships as .woff2 in src/styles/fonts/. Inter is NOT in this repo — it comes from the @fontsource-variable/inter npm package, or fonts.google.com. Canva brand-font upload may not accept .woff2; convert to .otf/.ttf if it refuses.',
  },
  // A Canva Brand Kit holds a logo as well as colours and fonts. Omitting it
  // was the same gap that produced a typeset wordmark in generated output —
  // if the mark is not in the export, whoever wires this up will substitute text.
  logo: {
    svg: {
      black: `${CANVA_RAW}brand/logo/svg/2one-logo-black.svg`,
      white: `${CANVA_RAW}brand/logo/svg/2one-logo-white.svg`,
    },
    png: { black_1024: `${CANVA_RAW}brand/logo/png/2one-logo-black-1024w.png`, white_1024: `${CANVA_RAW}brand/logo/png/2one-logo-white-1024w.png` },
    rules: 'Black on light surfaces, white on dark. Never recolour, rotate, distort, or add effects. Minimum width 96px; clear space 0.5x the logo height. Never typeset "2one" as text in place of the mark.',
  },
  theme: 'light — Canva designs sit on light grounds. The dark palette is in tokens/colors.json → semantic_dark if needed.',
  rules: colors.rules,
}

const out = (p, obj) => { writeFileSync(join(root, p), JSON.stringify(obj, null, 2) + '\n'); console.log('  wrote', p) }
console.log('Generating canonical token JSON:')
out('tokens/colors.json', colors)
out('tokens/typography.json', typography)
out('tokens/spacing.json', spacing)
mkdirSync(join(root, 'integrations/canva'), { recursive: true })
out('integrations/canva/brand-kit.json', canva)
console.log('Done.')
