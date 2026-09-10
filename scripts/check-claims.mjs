/*
  Stale-claim guard. A payload is the single source of truth for its own design
  system, so a capability change (e.g. shipping dark mode) must not leave
  contradicting claims behind in prose/config. Docs that a human keeps in sync
  by hand always drift, so this check fails the build if a known-stale phrase
  survives anywhere in tracked text. Seeded from the real drift found after dark
  mode shipped, when eleven files still advertised a single theme.

  Run: npm run check:claims   (exits 1 on any match, printing file:line)

  The list itself is PAYLOAD DATA, not engine code. What counts as a stale claim
  is a fact about one design system: a single-theme claim is stale for a system
  that shipped a second theme, and is simply true for a system that ships one on
  purpose. Holding the list here would have made every client inherit 2one's
  history. It now lives at the path `paths.staleClaims` names, and a payload
  without that file simply has no stale-claim guard, which is a valid state
  rather than an error.

  The scan is rooted at the PAYLOAD, not at this file's directory. Rooting it at
  the engine meant a client run scanned 2one's prose and reported clean against
  a repo it had never opened.

  Generated files (manifest.json, graph.json) are scanned too, so a stale claim
  cannot hide there; fix it at its source and regenerate. The data file is
  excluded automatically, since it necessarily contains every phrase it bans.
*/
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

const root = cfg.root

// Which tracked files to scan: text sources where claims about the repo live.
const SCAN_EXT = /\.(md|mdx|json|jsonc|css|ts|tsx|mjs|cjs|html)$/i

const claimsRel = cfg.rel('staleClaims')
const claimsFile = claimsRel ? join(root, claimsRel) : null

if (!claimsFile || !existsSync(claimsFile)) {
  console.log(`\n  check:claims — no ${claimsRel ?? 'stale-claims'} in this payload, nothing to guard.\n`)
  process.exit(0)
}

const data = JSON.parse(readFileSync(claimsFile, 'utf8'))

/*
  Each rule: a human-readable reason + a case-insensitive pattern. Keep patterns
  SPECIFIC so legitimate text does not false-positive. A payload banning a
  phrase about a missing palette must not also match the APCA guard's own
  diagnostic about a missing theme block, so it bans the exact claim, never a
  loose substring.
*/
const BANNED = (data.banned ?? []).map((b) => ({ why: b.why, re: new RegExp(b.pattern, b.flags ?? 'i') }))

// Never scan these — they legitimately contain the banned phrases. The data file
// is added rather than named in the payload: a list cannot avoid quoting itself.
const EXCLUDE = new Set([...(data.exclude ?? []), claimsRel])

const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .split('\n')
  .map((f) => f.trim())
  .filter(Boolean)
  .filter((f) => SCAN_EXT.test(f) && !EXCLUDE.has(f))

const hits = []
for (const rel of files) {
  let text
  try {
    text = readFileSync(join(root, rel), 'utf8')
  } catch {
    continue
  }
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    for (const { why, re } of BANNED) {
      const m = re.exec(line)
      if (m) hits.push({ rel, line: i + 1, match: m[0].trim(), why })
    }
  })
}

if (hits.length) {
  console.error(`\n  ✗ check:claims — ${hits.length} stale claim(s) found:\n`)
  for (const h of hits) {
    console.error(`    ${h.rel}:${h.line}  “${h.match}”  — ${h.why}`)
  }
  console.error('\n  Fix the wording (prose is hand-edited; manifest.json/graph.json regenerate via')
  console.error('  `npm run build:meta`). If the phrase is now legitimate, refine the pattern in')
  console.error(`  ${claimsRel} — never just add an exception for a real stale claim.\n`)
  process.exit(1)
}

console.log(`✓ check:claims — no stale capability claims in ${files.length} tracked files`)
