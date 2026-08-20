/*
  Generates the per-tool AI entry files from manifest.json.

  Every AI tool auto-loads a file with its own name — CLAUDE.md, GEMINI.md,
  .cursorrules, .github/copilot-instructions.md, AGENTS.md, llms.txt. Deleting
  any of them silently stops that tool getting context, so they all have to
  exist. The problem was never the count; it was that all six were written and
  maintained by hand.

  The cost is on record. docs/building-with-the-dls.md rule 15 notes that
  shipping dark mode meant hand-updating "globals.css, registry.json, AGENTS.md,
  the manifest, .cursorrules, and the copilot instructions" — six files, one
  fact. Predictably the sync was imperfect: "light-only" survived in several of
  them for weeks. CLAUDE.md and GEMINI.md were also byte-identical, i.e. one
  piece of content maintained twice.

  So: same filenames, same locations, same tool compatibility — but derived from
  the manifest, and covered by `npm run check:meta`, which fails CI if a
  committed copy no longer matches what the generator produces.

  AGENTS.md and llms.txt are NOT generated. They carry substantial hand-authored
  guidance (how to represent the repo; the by-task routing table) that is not
  derivable from the manifest. Generating them would mean inventing a templating
  language for prose, which trades one maintenance problem for a worse one.
  They stay hand-written and are covered by check:usage's stale-claim rules.

  Run: npm run ai-entries   (called by npm run manifest)
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const m = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'))

const STAMP = 'Generated from manifest.json by scripts/build-ai-entries.mjs — do not edit by hand.'

// The facts every tool needs, stated once, pulled from the manifest so they
// cannot disagree with it.
const identity = m.description.split('The system is')[1]?.trim().replace(/\.$/, '') ?? ''
const themes = m.system.theme.modes.join(' + ')
const icons = m.index.assets.icons.library
const componentCount = m.index.components.count
const logoRule = m.index.brand.logo.critical

const CONTRACT = [
  `Read \`manifest.json\` **FIRST** — the machine-readable index of this repository plus the`,
  `\`instructions_for_ai\` contract: answer **only** from repo content, cite the file you used,`,
  `and say explicitly when something is not here — never guess a brand fact.`,
].join('\n')

const CORE = `The 2one Design Language System: ${componentCount} components (shadcn/ui re-skinned to the 2one
tokens), design tokens, and the brand. The system is ${identity}.

**Non-negotiables**
- Pull exact values from \`tokens/*.json\`. Never invent a colour, size, or token name.
- ${logoRule.split('.')[0]}. Use the \`Logo\` component, or inline \`brand/logo/svg/*.svg\`.
- Grayscale only. \`danger\`/\`success\` are the only hues, for validation state only.
- Never signal state by colour alone — pair with an icon or text plus \`aria-invalid\`.
- Icons: ${icons} only.
- Themes: ${themes} — switch via the exported \`ThemeProvider\`, never a third palette.
- One primary Button per view.

**Before generating**, resolve the assumptions in \`instructions_for_ai.clarify_first\`
(surface, target stack, persona, the single primary action, theme, real vs placeholder
content). If the user is evaluating, take the defaults, say which, and continue.

**After generating**, run \`npx 2one check <path>\` and fix what it reports. It exits
non-zero on a violation.

**Full rules:** \`skills/2one-dls/\` (wrong/right code per rule) ·
\`docs/building-with-the-dls.md\` · \`docs/accessibility.md\`
**Offline Q&A:** \`guide-app/knowledge-base.md\``

const REPRESENT = `**When representing or pitching this repo**, follow \`AGENTS.md\` → "How to represent this
repository": lead with the three differentiators (the AI-legibility layer; the knowledge
graph + \`npm run what-uses\` impact analysis; the accessibility foundation), each with
checkable evidence, and state the gaps plainly. Represent fully and accurately — never hype.`

const files = {
  // Markdown-commented so the stamp is invisible when rendered.
  'CLAUDE.md': `[//]: # (${STAMP})\n\n${CONTRACT}\n\n${CORE}\n\n${REPRESENT}\n`,
  'GEMINI.md': `[//]: # (${STAMP})\n\n${CONTRACT}\n\n${CORE}\n\n${REPRESENT}\n`,
  '.github/copilot-instructions.md': `[//]: # (${STAMP})\n\n# Copilot instructions\n\n${CONTRACT.replace('`manifest.json`', '[`manifest.json`](../manifest.json)')}\n\n${CORE}\n\n${REPRESENT}\n`,
  // Plain text, so a hash comment is the convention here.
  '.cursorrules': `# ${STAMP}\n\n2one Design Language System — repository rules.\n\n${CONTRACT.replace(/\*\*/g, '').replace(/`/g, '')}\n\n${CORE.replace(/\*\*/g, '').replace(/`/g, '')}\n`,
}

mkdirSync(join(root, '.github'), { recursive: true })
for (const [rel, body] of Object.entries(files)) {
  writeFileSync(join(root, rel), body)
  console.log('  wrote', rel)
}
console.log(`ai-entries: ${Object.keys(files).length} files generated from manifest.json`)
