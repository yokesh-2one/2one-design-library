/*
  check:web-copy — mechanical guard for the web-writing rules (docs/web-writing.md,
  brand/brand.json → writing_rules, rules/ux-rules.json: link-text-descriptive,
  no-invented-capabilities, copy-em-dash).

  It scans visible copy for the tells that a static check CAN catch, and stays quiet
  about everything that needs a human copy pass (grade level, "does the H1 lead with the
  outcome", claim accuracy). It does NOT replace visual QA or a copy review.

  Two levels:
    • ERROR (exit 1): unambiguous link slop — "click here" / "read more" as link text,
      a raw URL used as the visible label, and "not just X, but Y" contrast padding.
    • WARN (exit 0): bait words and em-dash piles — real tells, but each has legitimate
      exceptions (a bait word that is a real term in a repo file; an occasional em-dash),
      so they are surfaced for a human, not failed.

  Default target: src/blocks/marketing (the library's own web copy). Pass one or more
  paths to scan other surfaces, e.g. `node scripts/check-web-copy.mjs origin`.
  Run: npm run check:web-copy
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, isAbsolute } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const requested = process.argv.slice(2).length ? process.argv.slice(2) : ['src/blocks/marketing']
const targets = requested.map((t) => (isAbsolute(t) ? t : join(root, t)))
for (const t of targets) if (!existsSync(t)) console.warn(`  ⚠ check:web-copy — target not found, skipping: ${t}`)
const present = targets.filter((t) => existsSync(t))

const EXT = /\.(tsx?|jsx?|md|html)$/
const SKIP = /node_modules|dist|dist-site|dist-origin|__screenshots__|\.d\.ts$/

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (SKIP.test(p)) continue
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (EXT.test(name)) out.push(p)
  }
  return out
}

// Unambiguous link slop → ERROR.
const ERROR_PATTERNS = [
  { id: 'link-text-descriptive', re: /\bclick here\b/gi, msg: '"click here" as link text — name the destination instead' },
  { id: 'link-text-descriptive', re: /\bread more\b/gi, msg: '"read more" as link text — name what is being read' },
  { id: 'link-text-descriptive', re: />\s*https?:\/\/[^<\s]+\s*</g, msg: 'a raw URL is the visible link text — use a destination name' },
  { id: 'copy-contrast-padding', re: /\bnot just\b[^.!?\n]{0,60}\bbut\b/gi, msg: '"not just X, but Y" contrast padding — state it plainly' },
  { id: 'copy-contrast-padding', re: /it[’']s not (just|only)\b[^.!?\n]{0,80}it[’']s\b/gi, msg: '"it\'s not just… it\'s…" padding — state it plainly' },
]

// Judgement calls → WARN.
const BAIT = /\b(delve|leverage|unlock|elevate|seamless|robust|spearhead|tapestry|landscape|journey|battle-tested)\b/gi
const EMDASH_PILE = 4 // per file, matching rules/ux-rules.json copy-em-dash

const errors = []
const warnings = []
let scanned = 0

for (const target of present) {
  const files = statSync(target).isDirectory() ? walk(target) : [target]
  for (const file of files) {
    scanned++
    const text = readFileSync(file, 'utf8')
    const rel = relative(root, file).replace(/\\/g, '/')

    for (const { re, msg } of ERROR_PATTERNS) {
      for (const m of text.matchAll(re)) {
        const line = text.slice(0, m.index).split('\n').length
        errors.push(`${rel}:${line} — ${msg}`)
      }
    }

    const bait = [...text.matchAll(BAIT)].map((m) => m[0].toLowerCase())
    if (bait.length) warnings.push(`${rel} — bait word(s): ${[...new Set(bait)].join(', ')} (allowed only if it's a real term from a repo file)`)

    const emdashes = (text.match(/—/g) || []).length
    if (emdashes >= EMDASH_PILE) warnings.push(`${rel} — ${emdashes} em-dashes (copy-em-dash flags ${EMDASH_PILE}+ per view) — vary the punctuation`)
  }
}

if (warnings.length) {
  console.warn('\n  ⚠ check:web-copy — advisory (not failing):')
  for (const w of warnings) console.warn(`    • ${w}`)
}

if (errors.length) {
  console.error(`\n  ✗ check:web-copy — ${errors.length} web-copy violation(s) (see docs/web-writing.md):\n`)
  for (const e of errors) console.error(`    • ${e}`)
  console.error('')
  process.exit(1)
}

console.log(`  ✓ check:web-copy — ${scanned} file(s) scanned, no link slop or contrast padding${warnings.length ? ` (${warnings.length} advisory)` : ''}.`)
