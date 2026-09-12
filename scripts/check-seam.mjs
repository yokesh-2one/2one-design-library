/*
  The seam guard. Engine code must not name payload paths.

  `scripts/` is the ENGINE: generic machinery that runs against ANY design
  system. `dls.config.json` is how a payload says where its files live. Every
  path literal in engine code is a place the engine assumed it was running
  against 2one, and it fails silently against a client: the script reads a path
  that is not there, catches nothing, and reports success having done nothing.

  That is not hypothetical. It is how `check-claims` came to scan the engine's
  own prose and report clean against a client repo it had never opened.

  So this check fails the build on any payload-shaped path literal in engine
  code, and the count it holds at is ZERO. Not "few", not "down from 50":
  a seam with three leaks left is a seam a client discovers one path at a time.

  ---- what counts ----

  Comments are stripped before scanning, because prose explaining a historical
  path is not a path the engine resolves. Test files are skipped: a fixture
  writing `src/App.tsx` into a temp dir is inventing a fake payload, which is
  the opposite of assuming a real one.

  Everything else must either use `cfg.path()` / `cfg.rel()`, or appear in
  ALLOWED below WITH A REASON. The allowlist is deliberately noisy to read: an
  exception with a written justification is a decision, an exception without one
  is a leak that learned to hide.

  Run: npm run check:seam
*/
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as cfg } from './lib/config.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const BACKSLASH = String.fromCharCode(92)

/*
  Payload-shaped: a path rooted at one of the directories a design system keeps
  its material in, or one of the generated artifacts at the payload root. The
  list comes from the DEFAULTS in lib/config.mjs, because those are precisely
  the things a payload is allowed to move.
*/
const PAYLOAD_PATH =
  /(['"`])((?:src|tokens|brand|rules|graph|schema|dev|docs|skills|guide-app|integrations)[/][^'"`]*|manifest[.]json|graph[.]json|dls[.]identity[.]json|dls[.]config[.]json)(['"`])/g

/*
  Exceptions, each with the reason it is not a leak. Keyed by file, then by the
  literal. A reason is mandatory: this object is the record of every place the
  engine is allowed to say a path out loud.
*/
const ALLOWED = {
  'init-payload.mjs': {
    'src/index.ts': 'discovery candidate: this script EXISTS to guess an unknown payload layout',
    'src/index.tsx': 'discovery candidate, as above',
    'rules/ux-rules.json': 'names the DEFAULT it would write, in a warning about what is missing',
    'graph/ontology.json': 'names the default it would write, as above',
    'graph/decisions.json': 'names the default it would write, as above',
    'dls.identity.json': 'names the default it would write, as above',
  },
  'dls-info.mjs': {
    'src/index.css': "probes the CONSUMER's app for its stylesheet, not the payload's",
    'src/app.css': 'consumer probe, as above',
    'src/globals.css': 'consumer probe, as above',
    'src/styles/globals.css': 'consumer probe, as above',
  },
  'check-usage.mjs': {
    'graph.json': 'installed-package fallback: looks one level UP, outside any payload root',
    'manifest.json': 'installed-package fallback, as above',
  },
  'check-package.mjs': {
    'dls.identity.json': 'asserts the packaged file list, which is a fact about packaging not layout',
  },
  'check-logo-sizing.mjs': {
    'manifest.json': "the logo set's own index, resolved INSIDE cfg.rel('brand.logo')",
  },
}

/*
  Comment detection is LINE-BASED on purpose, and the naive version is worse
  than useless here.

  Stripping `/* ... *\/` by regex treats a glob like `tokens/*.json` as the start
  of a comment and blanks everything after it. Stripping `//` to end of line eats
  the markdown comment marker `[//]:` that the generated AI entry files begin
  with. Both appear in build-ai-entries.mjs, and together they hid ten real leaks
  in that one file: the checker reported clean because it had blinded itself.

  A rule that stops firing looks exactly like a rule that passes, which is the
  failure this repo keeps finding. So: a block comment is a line whose trimmed
  text STARTS with the opener, which is how every comment in this codebase is
  written, and a string containing a glob never is.
*/
const commentFreeLines = (src) => {
  const out = []
  let inBlock = false
  for (const line of src.split('\n')) {
    const t = line.trim()
    if (inBlock) {
      out.push('')
      if (t.includes('*/')) inBlock = false
      continue
    }
    if (t.startsWith('/*')) {
      out.push('')
      if (!t.includes('*/')) inBlock = true
      continue
    }
    out.push(t.startsWith('//') ? '' : line)
  }
  return out
}

const walk = (d, acc = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    if (statSync(p).isDirectory()) { if (e !== 'node_modules') walk(p, acc) }
    else if (e.endsWith('.mjs')) acc.push(p)
  }
  return acc
}

const leaks = []
for (const file of walk(here)) {
  const rel = relative(here, file).split(BACKSLASH).join('/')
  if (rel === 'lib/config.mjs') continue // the one place a layout is written down
  if (rel.endsWith('.test.mjs')) continue // fixtures invent payloads, they do not assume one
  if (rel === 'check-seam.mjs') continue // this file names them all by definition

  const allowed = ALLOWED[rel] ?? {}
  const lines = commentFreeLines(readFileSync(file, 'utf8'))
  lines.forEach((line, i) => {
    for (const m of line.matchAll(PAYLOAD_PATH)) {
      const lit = m[2]
      if (allowed[lit]) continue
      leaks.push({ rel, line: i + 1, lit, src: line.trim().slice(0, 96) })
    }
  })
}

if (leaks.length) {
  console.error(`\n  ✗ check:seam — ${leaks.length} payload path(s) named in engine code:\n`)
  let current = ''
  for (const l of leaks) {
    if (l.rel !== current) { current = l.rel; console.error(`    ${l.rel}`) }
    console.error(`      ${String(l.line).padStart(4)}  ${l.lit}`)
    console.error(`            ${l.src}`)
  }
  console.error(`
  Each of these is a path the engine will look for in a CLIENT's repo and not
  find. Resolve it through the payload instead:

      cfg.path('components')     absolute, for reading
      cfg.rel('components')      repo-relative, for anything user-facing

  If a literal genuinely is not a payload path — a discovery candidate, a probe
  of the consumer's own app, a packaging assertion — add it to ALLOWED in
  ${relative(cfg.root, fileURLToPath(import.meta.url)).split(BACKSLASH).join('/')}
  with the reason. An exception carries its justification or it is a leak.
`)
  process.exit(1)
}

const exceptions = Object.values(ALLOWED).reduce((n, o) => n + Object.keys(o).length, 0)
console.log(`\n  ✓ check:seam — no payload paths in engine code (${exceptions} documented exception(s))\n`)
