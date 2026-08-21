/*
  DTCG (W3C Design Tokens Community Group) export — tokens/tokens.dtcg.json

  Why this exists: tokens/*.json is a 2one-shaped schema, and tokens/*.css is
  Tailwind-shaped. Neither can be imported by design tooling. DTCG is the neutral
  interchange format every design tool understands, so this is the file that
  crosses the boundary out of the web stack:

    Figma      — Tokens Studio imports it as variables (colour, number, string)
    Other UI   — a MudBlazor/SwiftUI/Compose theme generator reads the same file
    Style Dictionary — consumes DTCG natively for any other platform target

  Emitted as ONE file with top-level groups acting as token sets:
    color.*        primitive ramps — theme-independent
    light.* dark.* semantic sets, one per theme
    font.* text.*  families, weights, sizes, line-heights + composite text styles
    dimension.*    spacing + radius

  Semantic tokens ALIAS their ramp step (`{color.neutral.950}`) wherever the hex
  matches one, so the derived_from relationship survives into Figma as a real
  variable reference rather than a duplicated literal. Tokens whose value sits
  off-ramp are emitted as literals and reported at the end — those are the ones
  that silently drift when the palette is regenerated.

  Generated. Run: npm run tokens
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

const root = cfg.root
const read = (p) => readFileSync(join(root, p), 'utf8')
const parseVars = (css) => {
  const o = {}
  for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) o[m[1].trim()] = m[2].trim()
  return o
}
const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v)
const block = (css, re) => (css.match(re) || ['', ''])[1]

const globals = readFileSync(cfg.path('theme'), 'utf8')
const lightVars = parseVars(block(globals, /:root\s*\{([^}]*)\}/))
const darkVars = parseVars(block(globals, /\.dark\s*\{([^}]*)\}/))
const rampVars = parseVars(readFileSync(cfg.path('tokenSources.colors'), 'utf8'))
const typeVars = parseVars(readFileSync(cfg.path('tokenSources.typography'), 'utf8'))
const spaceVars = parseVars(readFileSync(cfg.path('tokenSources.spacing'), 'utf8'))

// rem/px → px string. Figma variables are numeric, so px travels cleanest.
const toPx = (v) => {
  const s = String(v).trim()
  if (s.endsWith('rem')) return `${Math.round(parseFloat(s) * 16 * 100) / 100}px`
  if (s.endsWith('px')) return s
  const n = parseFloat(s)
  return Number.isFinite(n) ? `${n}px` : s
}

// ---- primitive ramps ----
const RAMP_ORDER = ['neutral', 'accent', 'danger', 'success'] // alias preference when hexes collide
const color = { $type: 'color' }
for (const name of RAMP_ORDER) {
  const steps = Object.entries(rampVars)
    .filter(([k, v]) => k.startsWith(`--color-${name}-`) && isHex(v))
    .map(([k, v]) => [k.replace(`--color-${name}-`, ''), v.toLowerCase()])
  if (steps.length) color[name] = Object.fromEntries(steps.map(([s, v]) => [s, { $value: v }]))
}

// hex → alias path, first match wins in RAMP_ORDER (neutral-50 and accent-50
// share #fafafa, so the order makes the choice deterministic rather than lucky)
const hexToAlias = {}
for (const name of RAMP_ORDER) {
  for (const [step, tok] of Object.entries(color[name] ?? {})) {
    if (!(tok.$value in hexToAlias)) hexToAlias[tok.$value] = `{color.${name}.${step}}`
  }
}

// ---- semantic sets, one per theme ----
const offRamp = new Set()
const semanticSet = (vars, themeName) => {
  const out = { $type: 'color' }
  for (const [k, v] of Object.entries(vars)) {
    if (!isHex(v)) continue
    const hex = v.toLowerCase()
    const alias = hexToAlias[hex]
    if (!alias) offRamp.add(`${themeName}.${k.replace('--', '')} = ${hex}`)
    out[k.replace('--', '')] = { $value: alias ?? hex }
  }
  return out
}
const light = semanticSet(lightVars, 'light')
const dark = semanticSet(darkVars, 'dark')

// ---- typography ----
const SCALE = ['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'base', 'sm', 'xs']
const HEADING = new Set(['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const firstFamily = (v, fallback) =>
  (v || fallback).split(',')[0].replace(/['"]/g, '').trim()

const font = {
  family: {
    $type: 'fontFamily',
    heading: { $value: firstFamily(typeVars['--font-heading'], 'Satoshi') },
    body: { $value: firstFamily(typeVars['--font-sans'], 'Inter') },
  },
  weight: {
    $type: 'fontWeight',
    normal: { $value: 400 },
    medium: { $value: 500 },
    semibold: { $value: 600 },
    bold: { $value: 700 },
  },
  size: { $type: 'dimension' },
  lineHeight: { $type: 'dimension' },
}
for (const k of SCALE) {
  if (typeVars[`--text-${k}`]) font.size[k] = { $value: toPx(typeVars[`--text-${k}`]) }
  if (typeVars[`--leading-${k}`]) font.lineHeight[k] = { $value: toPx(typeVars[`--leading-${k}`]) }
}

// Composite typography tokens — these become real text styles in Figma,
// which a bare size/line-height pair cannot.
const text = { $type: 'typography' }
for (const k of SCALE) {
  if (!font.size[k]) continue
  text[k] = {
    $value: {
      fontFamily: HEADING.has(k) ? '{font.family.heading}' : '{font.family.body}',
      fontSize: `{font.size.${k}}`,
      fontWeight: HEADING.has(k) ? '{font.weight.bold}' : '{font.weight.normal}',
      ...(font.lineHeight[k] ? { lineHeight: `{font.lineHeight.${k}}` } : {}),
    },
  }
}

// ---- dimensions ----
const pick = (prefix) =>
  Object.fromEntries(
    Object.entries(spaceVars)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.replace(prefix, ''), { $value: toPx(v) }])
  )
const dimension = {
  spacing: { $type: 'dimension', ...pick('--spacing-') },
  radius: { $type: 'dimension', ...pick('--radius-') },
}

// ---- write ----
const doc = {
  $description:
    '2one Design Language System — W3C DTCG export. Generated by scripts/build-dtcg.mjs; do not edit by hand. Top-level groups act as token sets: `color` holds theme-independent primitive ramps; `light` and `dark` hold the semantic sets (apply one at a time); `font`, `text`, and `dimension` are theme-independent. Semantic tokens alias their ramp step where one exists. Grayscale system — no brand hue; danger/success are reserved for validation state only.',
  color,
  light,
  dark,
  font,
  text,
  dimension,
}

writeFileSync(join(root, 'tokens/tokens.dtcg.json'), JSON.stringify(doc, null, 2) + '\n')

const count = (o) => Object.keys(o).filter((k) => !k.startsWith('$')).length
console.log('  wrote tokens/tokens.dtcg.json')
console.log(
  `    ${RAMP_ORDER.filter((r) => color[r]).reduce((n, r) => n + count(color[r]), 0)} primitives · ` +
    `${count(light)} light · ${count(dark)} dark · ${count(text)} text styles · ` +
    `${count(dimension.spacing) + count(dimension.radius)} dimensions`
)
if (offRamp.size) {
  console.log(`    note: ${offRamp.size} semantic value(s) sit off-ramp and are emitted as literals:`)
  for (const s of [...offRamp].sort()) console.log(`      · ${s}`)
}
