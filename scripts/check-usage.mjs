/*
  check-usage — audits generated or hand-written UI code against the 2one rules.

  The other checks in this repo verify the SYSTEM (tokens valid, contrast passes,
  generated files in sync). This one verifies OUTPUT: code someone — or some
  model — wrote while using the system. That is the gap the manifest cannot
  close on its own, because a document can only prevent mistakes an agent chose
  to read.

  Every rule here already exists in prose in docs/building-with-the-dls.md or
  brand/logo/manifest.json. This turns them from advisory into checkable.

  Usage:
    node scripts/check-usage.mjs <file|dir> [...]     # defaults to src/blocks
    node scripts/check-usage.mjs --json <file>        # machine-readable
    node scripts/check-usage.mjs --warnings <file>    # warnings fail too

  Exit code: 1 if any error-severity finding (or any finding with --warnings).
*/
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const asJson = args.includes('--json')
const strict = args.includes('--warnings')
const targets = args.filter((a) => !a.startsWith('--'))

/*
  The knowledge graph is the authority on which tokens exist. Without it this
  file can only catch tokens from OTHER systems (bg-blue-500) — it cannot catch
  an invented 2one-shaped one. `bg-muted-strong` and `text-surface-elevated`
  look exactly like this system's vocabulary, are entirely fictional, and passed
  every check until graph.json was consulted. That is the failure mode a model
  actually has: not reaching for Bootstrap, but confidently inventing a token
  that sounds like yours.
*/
const graph = (() => {
  for (const p of [join(root, 'graph.json'), join(root, '..', 'graph.json')]) {
    try { return JSON.parse(readFileSync(p, 'utf8')) } catch { /* try next */ }
  }
  return null
})()

const knownTokens = new Set()
if (graph) {
  for (const n of graph.nodes) {
    if (n.type === 'token-color') knownTokens.add(n.label)          // primary, muted-foreground …
    if (n.type === 'ramp') knownTokens.add(n.label)                  // neutral-250, danger-700 …
    if (n.type === 'token-radius') knownTokens.add(n.label.replace(/^radius-/, ''))
  }
}

// Tailwind literals and utility keywords that share a prefix with colour utilities
// but are not tokens. Without these the rule drowns in false positives.
const NON_TOKEN = new Set([
  'transparent', 'current', 'inherit', 'white', 'black', 'none', 'auto', 'clip', 'ellipsis',
  'left', 'center', 'right', 'justify', 'start', 'end', 'top', 'bottom', 'balance', 'pretty',
  'wrap', 'nowrap', 'solid', 'dashed', 'dotted', 'double', 'hidden', 'collapse', 'separate',
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
  'display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'full', 'md',
])

// Tailwind's stock palettes. The 2one system is grayscale: neutral/accent plus
// danger/success for validation. Any other hue is a second palette by definition.
const FOREIGN_HUES =
  'slate|gray|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const FOREIGN_ICONS = /from\s+['"](@tabler\/icons|react-icons|@heroicons|@fortawesome|@radix-ui\/react-icons|@phosphor-icons)/

/** @type {{id:string,severity:'error'|'warn',test:(ctx:any)=>{line:number,detail:string}[]}[]} */
const RULES = [
  {
    id: 'hardcoded-color',
    severity: 'error',
    why: 'Hard-coded colour drifts from the tokens and breaks re-theming. Use the semantic utilities (bg-primary, text-muted-foreground, border).',
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        // hex in a className or style, but not inside an SVG path/fill of a brand asset
        [...l.matchAll(/#[0-9a-fA-F]{3,8}\b/g)]
          .filter(() => !/\.svg|viewBox|d="M/.test(l))
          .map((m) => ({ line: i + 1, detail: `hard-coded ${m[0]}` }))
      ),
  },
  {
    id: 'foreign-palette',
    severity: 'error',
    why: 'The 2one system is grayscale — no brand hue anywhere. danger/success are the only hues and are reserved for validation state.',
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        [...l.matchAll(new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via)-(?:${FOREIGN_HUES})-\\d{2,3}\\b`, 'g'))].map(
          (m) => ({ line: i + 1, detail: `${m[0]} introduces a hue outside the system` })
        )
      ),
  },
  {
    id: 'invented-token',
    severity: 'error',
    why: 'This token does not exist in the system. Check graph.json or tokens/colors.json for the real name — a plausible-sounding token silently renders as nothing.',
    test: ({ lines }) => {
      if (!graph) return [] // graph unavailable — stay silent rather than guess
      return lines.flatMap((l, i) =>
        [...l.matchAll(/\b(?:bg|text|border|ring|fill|stroke|outline|divide|placeholder|caret|decoration)-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\b/g)]
          // Tailwind puts modifiers between the prefix and the colour:
          // ring-offset-background, border-l-transparent, divide-y-border.
          // Strip them so the check sees the colour name itself.
          .map((m) => m[1].replace(/^(?:offset-|[btlrxyse]-(?=\D))/, ''))
          .filter((name) => {
            if (knownTokens.has(name) || NON_TOKEN.has(name)) return false
            if (new RegExp(`^(?:${FOREIGN_HUES})(?:-\\d{2,3})?$`).test(name)) return false // its own rule
            if (/^\d/.test(name) || /\[/.test(name)) return false                          // border-2, arbitrary
            if (/^[btlrxyse](?:-\d+)?$/.test(name)) return false                           // border-b, border-t-0
            if (/^gradient-/.test(name)) return false                                      // bg-gradient-to-r
            if (name.length < 3) return false
            // Only names shaped like this system's semantic tokens. A real but
            // unlisted single word would be missed; the alternative is drowning
            // the report in Tailwind's own utility vocabulary, which gets the
            // check switched off entirely.
            return /-/.test(name)
          })
          .map((name) => ({ line: i + 1, detail: `"${name}" is not a token in this system` }))
      )
    },
  },
  {
    id: 'foreign-icons',
    severity: 'error',
    why: 'lucide only. A second icon set is one of the most visible "AI-generated" tells (rule 7).',
    test: ({ lines }) =>
      lines.flatMap((l, i) => (FOREIGN_ICONS.test(l) ? [{ line: i + 1, detail: l.trim().slice(0, 80) }] : [])),
  },
  {
    id: 'typeset-wordmark',
    severity: 'error',
    why: 'The wordmark is an asset, never type. Import Logo (React) or inline brand/logo/svg/*.svg.',
    test: ({ src, lines }) => {
      if (/from\s+['"][^'"]*\/logo['"]|<Logo\b/.test(src)) return []
      return lines.flatMap((l, i) =>
        // "2one" as the entire VISIBLE text of an element. sr-only text is the
        // accessible name for a logo link — correct practice, not a violation;
        // the placeholder-brand-mark rule below is what catches that case.
        /\bsr-only\b/.test(l)
          ? []
          : [...l.matchAll(/>\s*2one\s*</gi)].map((m) => ({
              line: i + 1,
              detail: `"${m[0].trim()}" — wordmark typeset as text`,
            }))
      )
    },
  },
  {
    id: 'placeholder-brand-mark',
    severity: 'error',
    why: 'A brand slot exists (sr-only "2one" or aria-label) but the real mark is absent — a generic icon is standing in for the wordmark. Import Logo.',
    test: ({ src, lines }) => {
      if (/from\s+['"][^'"]*\/logo['"]|<Logo\b/.test(src)) return []
      return lines.flatMap((l, i) =>
        /(?:sr-only[^>]*>\s*2one\s*<|aria-label\s*=\s*["']2one["'])/i.test(l)
          ? [{ line: i + 1, detail: 'brand slot labelled "2one" but no Logo component in this file' }]
          : []
      )
    },
  },
  {
    id: 'multiple-primary-buttons',
    severity: 'error',
    why: 'One primary action per view. Pair a secondary/outline with it for lesser actions.',
    test: ({ src }) => {
      const opens = [...src.matchAll(/<Button\b([^>]*)>/g)]
      const primaries = opens.filter((m) => !/variant\s*=/.test(m[1]) || /variant\s*=\s*["{]?['"]?default/.test(m[1]))
      if (primaries.length <= 1) return []
      const line = (idx) => src.slice(0, idx).split('\n').length
      return primaries.slice(1).map((m) => ({
        line: line(m.index),
        detail: `${primaries.length} primary Buttons in this view — only one may be primary`,
      }))
    },
  },
  {
    id: 'inline-spacing',
    severity: 'warn',
    why: 'One 8px spacing scale via Tailwind utilities. Ad-hoc inline margins are the most visible inconsistency tell (rule 3).',
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        [...l.matchAll(/style=\{\{[^}]*\b(margin|padding|gap)[A-Za-z]*\s*:/g)].map((m) => ({
          line: i + 1,
          detail: `inline ${m[1]} — use the spacing scale`,
        }))
      ),
  },
  {
    id: 'off-scale-spacing',
    severity: 'warn',
    why: 'Arbitrary spacing values sit off the 8px scale. Prefer a scale step (gap-4, p-6).',
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        [...l.matchAll(/\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-\[(\d+)px\]/g)]
          .filter((m) => Number(m[1]) % 4 !== 0)
          .map((m) => ({ line: i + 1, detail: `${m[0]} is off the 4/8px scale` }))
      ),
  },
  {
    id: 'handrolled-card',
    severity: 'warn',
    why: 'Every panel is a real Card — same border, radius, padding, shadow (rule 4). Do not build a parallel container.',
    test: ({ lines }) =>
      lines.flatMap((l, i) => {
        if (!/<div\b/.test(l)) return []
        const hasBorder = /\bborder\b/.test(l)
        const hasRadius = /\brounded-(?:lg|xl|2xl)\b/.test(l)
        const hasSurface = /\bbg-(?:card|background|white)\b/.test(l) || /\bshadow-/.test(l)
        return hasBorder && hasRadius && hasSurface
          ? [{ line: i + 1, detail: 'div styled as a card — use <Card> instead' }]
          : []
      }),
  },
  {
    id: 'color-only-state',
    severity: 'warn',
    why: 'Never signal state by colour alone — pair with an icon or text, plus aria-invalid (rule 5, non-negotiable).',
    test: ({ src, lines }) => {
      const hasSignal = /aria-invalid|aria-describedby|FieldError|role=["']alert["']/.test(src)
      if (hasSignal) return []
      return lines.flatMap((l, i) =>
        /\b(?:border|text|ring)-destructive\b/.test(l)
          ? [{ line: i + 1, detail: 'destructive styling with no aria-invalid / error text nearby' }]
          : []
      )
    },
  },
]

// ---- collect files ----
const CODE = new Set(['.tsx', '.jsx', '.ts', '.js', '.html'])
const walk = (p, acc = []) => {
  const s = statSync(p)
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) if (f !== 'node_modules' && !f.startsWith('.')) walk(join(p, f), acc)
  } else if (CODE.has(extname(p))) acc.push(p)
  return acc
}
const files = (targets.length ? targets : ['src/blocks'])
  .map((t) => (t.startsWith('/') || /^[A-Za-z]:/.test(t) ? t : join(root, t)))
  .flatMap((p) => walk(p))

// ---- run ----
const findings = []
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')
  for (const rule of RULES) {
    for (const hit of rule.test({ src, lines })) {
      findings.push({
        file: relative(root, file).replace(/\\/g, '/'),
        line: hit.line,
        rule: rule.id,
        severity: rule.severity,
        detail: hit.detail,
        why: rule.why,
      })
    }
  }
}

const errors = findings.filter((f) => f.severity === 'error')
const warns = findings.filter((f) => f.severity === 'warn')

if (asJson) {
  console.log(JSON.stringify({ scanned: files.length, errors: errors.length, warnings: warns.length, findings }, null, 2))
} else {
  console.log(`\n  check-usage — ${files.length} file(s) scanned against the 2one rules\n`)
  if (!findings.length) {
    console.log('  ✓ no violations\n')
  } else {
    let current = ''
    for (const f of [...errors, ...warns]) {
      if (f.file !== current) {
        current = f.file
        console.log(`  ${f.file}`)
      }
      const tag = f.severity === 'error' ? 'error' : 'warn '
      console.log(`    ${tag}  ${String(f.line).padStart(4)}  ${f.rule}  —  ${f.detail}`)
      console.log(`                 ${f.why}`)
    }
    console.log(`\n  ${errors.length} error(s), ${warns.length} warning(s)\n`)
  }
}

process.exit(errors.length || (strict && warns.length) ? 1 : 0)
