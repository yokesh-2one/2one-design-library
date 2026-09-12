#!/usr/bin/env node
/*
  verify-themes — the browser-free fallback for "verify the render in both themes"
  (docs/building-with-the-dls.md rule 10). When a live preview/screenshot pipeline
  is unavailable, this proves the one thing that render check is really for: the
  palette actually SWAPS between light and dark.

  It parses the light `:root` and audited `.dark` token blocks in
  src/styles/globals.css and asserts that the core surface/ink tokens are REDEFINED
  and DIFFERENT under `.dark`. A token that is identical in both themes is a
  dark-mode smell — "invert-and-ship" leaving a light value behind.

  This is a smoke test, not the APCA audit — `npm run a11y` still checks that each
  theme's pairs clear contrast. Run: npm run verify:themes
*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const cssPath = join(here, '..', 'src', 'styles', 'globals.css')
const css = readFileSync(cssPath, 'utf8')

// The tokens whose whole job is to carry the theme — these MUST differ light↔dark.
const CORE = ['--background', '--foreground', '--card', '--popover', '--primary', '--muted', '--border']

function block(css, selectorRe) {
  const m = selectorRe.exec(css)
  if (!m) return null
  const open = css.indexOf('{', m.index)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i)
  }
  return null
}

function tokens(text) {
  const map = {}
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(text))) map[m[1]] = m[2].trim()
  return map
}

const light = block(css, /^:root\s*\{/m)
const dark = block(css, /^\.dark\s*\{/m)

const fail = (msg) => { console.error(`\n  ✗ verify-themes — ${msg}\n`); process.exit(1) }
if (!light) fail('could not find the :root (light) token block in src/styles/globals.css')
if (!dark) fail('could not find the .dark token block in src/styles/globals.css')

const L = tokens(light)
const D = tokens(dark)

const problems = []
for (const t of CORE) {
  if (!(t in L)) { problems.push(`${t} is not defined in :root (light)`); continue }
  if (!(t in D)) { problems.push(`${t} is not redefined under .dark — dark inherits the light value`); continue }
  if (L[t] === D[t]) problems.push(`${t} is identical in both themes (${L[t]}) — the theme does not flip it`)
}

// How many of the light tokens the dark theme actually overrides (informational).
const overridden = Object.keys(L).filter((t) => t in D)
const flipped = overridden.filter((t) => L[t] !== D[t])

if (problems.length) {
  console.error('\n  ✗ verify-themes — the palette does not fully swap between light and dark:\n')
  for (const p of problems) console.error(`    • ${p}`)
  console.error(`\n  Fix the .dark block in ${cfg.rel('theme')} so every core token carries a dark value.\n`)
  process.exit(1)
}

console.log(
  `\n  ✓ verify-themes — light and dark diverge: all ${CORE.length} core tokens flip; ` +
    `${flipped.length} of ${overridden.length} overridden tokens differ.\n` +
    `    (Smoke test only — run \`npm run a11y\` for the APCA contrast audit of each theme.)\n`,
)
