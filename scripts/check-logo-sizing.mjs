/*
  check:logo-sizing — keeps the logo's documented sizes honest (rule 15: derive or
  check a number, never hand-type it).

  brand/logo/manifest.json states minWidthPx: 96. A builder reasonably read that as
  the header size and shipped an oversized mark — but 96 is the STANDALONE/print
  floor, and the library's own chrome uses 46–64px. The `sizing` block now spells
  out the distinction; this asserts those numbers actually match how <Logo> is used
  in this repo, so the guidance can't drift from reality:

    • standaloneMinPx must equal rules.minWidthPx (one floor, stated once).
    • appChromePx.max must be BELOW standaloneMinPx (chrome is smaller — the point).
    • every real chrome-sized <Logo width> (below the standalone floor) must fall in
      [appChromePx.min, appChromePx.max]; every standalone/showcase one must be
      ≤ showcaseMaxPx. A usage outside the documented ranges fails here — update the
      doc deliberately or fix the usage.

  Run: npm run check:logo-sizing
*/
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

import { config as cfg } from './lib/config.mjs'

// Root at the PAYLOAD, not at this file. Resolving from the script directory
// meant a client run read 2one's files and reported on them.
const root = cfg.root
const m = JSON.parse(readFileSync(join(root, cfg.rel('brand.logo'), 'manifest.json'), 'utf8'))
const s = m.sizing
const errors = []

if (!s) errors.push('brand/logo/manifest.json has no `sizing` block')
else {
  if (s.standaloneMinPx !== m.rules.minWidthPx)
    errors.push(`sizing.standaloneMinPx (${s.standaloneMinPx}) must equal rules.minWidthPx (${m.rules.minWidthPx}) — one floor, stated once`)
  if (!(s.appChromePx.min <= s.appChromePx.typical && s.appChromePx.typical <= s.appChromePx.max))
    errors.push(`sizing.appChromePx.typical (${s.appChromePx.typical}) must sit within [min, max] = [${s.appChromePx.min}, ${s.appChromePx.max}]`)
  if (!(s.appChromePx.max < s.standaloneMinPx))
    errors.push(`sizing.appChromePx.max (${s.appChromePx.max}) must be BELOW standaloneMinPx (${s.standaloneMinPx}) — in-chrome is smaller than the standalone floor`)
}

// Collect every <Logo ... width={N}> across the source + sampler.
const widths = []
const walk = (p) => {
  for (const f of readdirSync(p)) {
    if (f === 'node_modules' || f.startsWith('.')) continue
    const abs = join(p, f)
    if (statSync(abs).isDirectory()) walk(abs)
    else if (['.tsx', '.jsx'].includes(extname(abs)))
      for (const w of readFileSync(abs, 'utf8').matchAll(/<Logo\b[^>]*\bwidth=\{(\d+)\}/g))
        widths.push({ px: Number(w[1]), file: abs.slice(root.length + 1).replace(/\\/g, '/') })
  }
}
for (const d of ['src', 'dev']) { try { walk(join(root, d)) } catch { /* dir may not exist */ } }

if (!errors.length && s) {
  if (!widths.length) errors.push('no <Logo width={…}> usages found to check the sizing guidance against')
  for (const { px, file } of widths) {
    if (px < s.standaloneMinPx) {
      if (px < s.appChromePx.min || px > s.appChromePx.max)
        errors.push(`${file}: <Logo width={${px}}> is chrome-sized but outside appChromePx [${s.appChromePx.min}, ${s.appChromePx.max}] — update sizing or the usage`)
    } else if (px > s.showcaseMaxPx) {
      errors.push(`${file}: <Logo width={${px}}> exceeds showcaseMaxPx (${s.showcaseMaxPx}) — update sizing or the usage`)
    }
  }
}

if (errors.length) {
  console.error('\n  ✗ check:logo-sizing — the logo sizing guidance does not match reality:\n')
  for (const e of errors) console.error(`    • ${e}`)
  console.error('')
  process.exit(1)
}
console.log(`  ✓ check:logo-sizing — ${widths.length} <Logo> usages fit the documented ranges (chrome ${s.appChromePx.min}–${s.appChromePx.max}px, standalone floor ${s.standaloneMinPx}px).`)
