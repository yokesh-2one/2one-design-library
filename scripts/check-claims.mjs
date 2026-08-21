/*
  Stale-claim guard. This repo is the single source of truth for the 2one DLS, so
  a capability change (e.g. shipping dark mode) must not leave contradicting claims
  behind in prose/config. Docs that a human keeps in sync by hand always drift — so
  this check fails the build if a known-stale phrase survives anywhere in tracked
  text. Seeded from the real drift found after dark mode shipped (11+ files still
  said "light-only"); extend BANNED whenever a new class of stale phrasing appears.

  Run: npm run check:claims   (exits 1 on any match, printing file:line)

  Note: CHANGELOG.md and this file are excluded — they legitimately name the phrases
  (history / the banned list itself). Generated files (manifest.json, graph.json) are
  scanned too, so a stale claim can't hide there; fix it at its source and regenerate.
*/
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Which tracked files to scan: text sources where claims about the repo live.
const SCAN_EXT = /\.(md|mdx|json|jsonc|css|ts|tsx|mjs|cjs|html)$/i

// Never scan these — they legitimately contain the banned phrases.
const EXCLUDE = new Set([
  'CHANGELOG.md',
  'scripts/check-claims.mjs',
  'package-lock.json',
])

// Each rule: a human-readable reason + a case-insensitive pattern. Keep patterns
// SPECIFIC so legitimate text doesn't false-positive — e.g. the APCA guard message
// "no .dark theme block found" must stay allowed, so we ban "no .dark palette", not
// a bare "no dark".
const BANNED = [
  { why: 'single-theme claim — the system ships light + audited dark', re: /\blight[\s-]only\b/i },
  { why: 'false claim — an audited .dark palette IS defined in globals.css', re: /\bno\s+`?\.?dark`?\s+palette\b/i },
  { why: 'false claim — dark: utilities resolve under .dark (they are not inert)', re: /\bstays?\s+inert\b/i },
  { why: 'stale roadmap — dark mode has shipped, it is not "not planned"', re: /\bdark(?:\s+theme)?[^.\n]{0,40}?\bnot\s+planned\b/i },
  { why: 'graph counts must be read live from graph.json → stats, never hard-coded (they drift)', re: /\b\d{2,4}\s+(?:nodes|edges)\b/i },
]

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
  console.error('  scripts/check-claims.mjs — never just add an exception for a real stale claim.\n')
  process.exit(1)
}

console.log(`✓ check:claims — no stale capability claims in ${files.length} tracked files`)
