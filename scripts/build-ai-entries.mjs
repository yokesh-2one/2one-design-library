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
  fact. Predictably the sync was imperfect: the stale single-theme wording
  survived in several of them for weeks. CLAUDE.md and GEMINI.md were also byte-identical, i.e. one
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
import { join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

// Root at the PAYLOAD, not at this file. Resolving from the script directory
// meant a client run read 2one's files and reported on them.
const root = cfg.root
const m = JSON.parse(readFileSync(join(root, cfg.rel('out.manifest')), 'utf8'))

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

/*
  The prose itself is PAYLOAD data, not engine code.

  This block used to hold 2one's sentences: the brand accent hex, the shadcn
  provenance, "One primary Button per view", and the paths to 2one's own docs.
  Rendered against a client payload, `npm run build:meta` would have written a
  CLAUDE.md telling their AI about 2one's fonts and 2one's install guide. The
  same leak was fixed in build-manifest long ago; this file was missed because
  its literals live inside a template string, where the comment stripper the
  seam guard used could not see them.

  The payload now carries the text at `identity.ai_entries`, with a small named
  placeholder vocabulary filled from the manifest. A payload without it gets a
  minimal entry built from the manifest alone, which is correct rather than
  wrong: a system that has not written its own instructions should not inherit
  someone else's.
*/
const MANIFEST_TICK = '`' + cfg.rel('out.manifest') + '`'

const FILL = {
  '{{component_count}}': String(componentCount),
  '{{identity}}': identity,
  '{{icons}}': icons,
  '{{themes}}': themes,
  '{{logo_rule}}': logoRule.split('.')[0],
}
const render = (text) => Object.entries(FILL).reduce((t, [k, v]) => t.split(k).join(v), text)

const entries = cfg.identity?.ai_entries ?? null
const CORE = entries?.core
  ? render(entries.core)
  : `${cfg.name}: ${componentCount} components, design tokens, and the brand. The system is ${identity}.

**Non-negotiables**
- Pull exact values from the token files. Never invent a colour, size, or token name.
- Icons: ${icons} only.
- Themes: ${themes} — switch via the exported \`ThemeProvider\`, never a third palette.

**After generating**, run \`npx 2one check <path>\` and fix what it reports. It exits
non-zero on a violation.`

const REPRESENT = entries?.represent ? render(entries.represent) : ''

const files = {
  // Markdown-commented so the stamp is invisible when rendered.
  'CLAUDE.md': `[//]: # (${STAMP})\n\n${CONTRACT}\n\n${CORE}\n\n${REPRESENT}\n`,
  'GEMINI.md': `[//]: # (${STAMP})\n\n${CONTRACT}\n\n${CORE}\n\n${REPRESENT}\n`,
  '.github/copilot-instructions.md': `[//]: # (${STAMP})\n\n# Copilot instructions\n\n${CONTRACT.replace(MANIFEST_TICK, `[${MANIFEST_TICK}](../${cfg.rel('out.manifest')})`)}\n\n${CORE}\n\n${REPRESENT}\n`,
  // Plain text, so a hash comment is the convention here.
  '.cursorrules': `# ${STAMP}\n\n2one Design Language System — repository rules.\n\n${CONTRACT.replace(/\*\*/g, '').replace(/`/g, '')}\n\n${CORE.replace(/\*\*/g, '').replace(/`/g, '')}\n`,
}

mkdirSync(join(root, '.github'), { recursive: true })
for (const [rel, body] of Object.entries(files)) {
  writeFileSync(join(root, rel), body)
  console.log('  wrote', rel)
}
console.log(`ai-entries: ${Object.keys(files).length} files generated from manifest.json`)
