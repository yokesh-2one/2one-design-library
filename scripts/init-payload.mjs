/*
  `2one init <repo>` — turn a client's repository into a payload the engine can read.

  Onboarding a second design system was, until now, a manual translation job:
  open the repo, work out which directory holds the components, which stylesheet
  holds the tokens, where the brand lives, then hand-write a dls.config.json and
  discover the mistakes one failing script at a time. fixtures/acme took an
  afternoon, and acme is thirteen files.

  This does the mechanical half. It reads the repo, proposes the config, and —
  the part that actually matters — reports what is MISSING in three tiers, so
  the gap between "the engine runs" and "the engine produces trustworthy output"
  is visible on day one instead of surfacing as a green check that means nothing.

  What it deliberately does NOT do: invent. Every value it writes is something
  it observed in the repo. Where it cannot observe a fact it leaves the key out
  and names it in the report, because a plausible-looking guess in a config file
  is indistinguishable from a real one three weeks later.

  Usage:
    2one init <path/to/repo>            write dls.config.json, print the report
    2one init <path/to/repo> --dry-run  print both, write nothing
    2one init <path/to/repo> --json     machine-readable report
*/
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, relative, basename, resolve, sep } from 'node:path'

import { CONFIG_FILE } from './lib/config.mjs'

const args = process.argv.slice(2).filter((a) => a !== 'init')
const flags = new Set(args.filter((a) => a.startsWith('--')))
const target = args.find((a) => !a.startsWith('--')) ?? process.cwd()
const dryRun = flags.has('--dry-run')
const asJson = flags.has('--json')

if (!existsSync(target)) {
  console.error(`\n  init: no such directory — ${target}\n`)
  process.exit(2)
}

const SKIP = new Set(['node_modules', '.git', 'build', 'out', '.next', '.turbo', 'coverage', '.cache', 'storybook-static'])
/*
  A subdirectory with its own package.json or dls.config.json is a DIFFERENT
  package, not part of this one. Without this guard, scanning 2one picked
  `astryx/src/gallery` (81 components — a separate product vendored into the
  repo) over `src/components/ui` (58, the actual library), and would have
  written a config describing someone else's system entirely. Build output was
  the same class of error: the theme file it chose was a hashed CSS bundle in
  dist-site, which contains every token and authors none.
*/
const isNestedPackage = (dir) => existsSync(join(dir, 'package.json')) || existsSync(join(dir, CONFIG_FILE))
const rel = (p) => relative(target, p).split(sep).join('/')
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }

/* ---- walk once; every detector reads from this ---- */
const dirs = []
const files = []
;(function walk(dir, depth) {
  if (depth > 6) return
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.storybook') continue
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (SKIP.has(e.name) || e.name.startsWith('dist') || isNestedPackage(full)) continue
      dirs.push(full)
      walk(full, depth + 1)
    } else if (e.isFile()) {
      files.push(full)
    }
  }
})(target, 0)

const tsxIn = (dir) => {
  try { return readdirSync(dir).filter((f) => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.stories.')) } catch { return [] }
}
const cssFiles = files.filter((f) => f.endsWith('.css'))
const textOf = (p) => { try { return readFileSync(p, 'utf8') } catch { return '' } }

/*
  ---- components ----
  The component directory is the one with the most .tsx files. Naming it `ui`
  is a shadcn convention, not a rule — acme calls it `parts` — so the count
  decides and the name only breaks ties.
*/
const byCount = dirs
  .map((d) => ({ dir: d, n: tsxIn(d).length }))
  .filter((d) => d.n > 0)
  .sort((a, b) => b.n - a.n || (basename(a.dir) === 'ui' ? -1 : 1))

const componentsDir = byCount[0]?.dir ?? null
/*
  `ownComponents` is the payload's OWN work as opposed to what it vendored in.
  In every layout seen so far that is the parent of the component directory —
  2one keeps 58 shadcn components in src/components/ui and its own handful in
  src/components. If the parent holds no .tsx files there is no such split, and
  pointing both keys at the same directory would double-count every component,
  so the key is omitted rather than guessed.
*/
const parent = componentsDir ? join(componentsDir, '..') : null
const ownDir = parent && tsxIn(parent).length > 0 ? parent : null

const blocksDir = dirs.find((d) => ['blocks', 'templates', 'patterns', 'examples'].includes(basename(d)) && tsxIn(d).length > 0)
  ?? dirs.find((d) => basename(d) === 'blocks')
  ?? null

const barrel = ['src/index.ts', 'src/index.tsx', 'index.ts', 'lib/index.ts']
  .map((p) => join(target, p))
  .find(existsSync) ?? null

/*
  ---- theme + token sources ----
  The theme stylesheet is the one that DEFINES custom properties (a `@theme`
  block, or a `:root` that declares them) rather than merely consuming them.
  Matching on filename alone picked `App.css` in a trial run — a file that
  reads tokens and defines none.
*/
const defines = (t) => /@theme\b/.test(t) || /:root\s*\{[^}]*--[\w-]+\s*:/.test(t)
const themed = cssFiles
  .map((f) => ({ f, t: textOf(f) }))
  .filter(({ t }) => defines(t))
  .sort((a, b) => (b.t.match(/--[\w-]+\s*:/g)?.length ?? 0) - (a.t.match(/--[\w-]+\s*:/g)?.length ?? 0))

const themeFile = themed[0]?.f ?? null
const named = (words) => themed.find(({ f }) => words.some((w) => basename(f).toLowerCase().includes(w)))?.f ?? null
const tokenSources = {
  colors: named(['color', 'colour', 'palette', 'hue']) ?? themeFile,
  typography: named(['typograph', 'type', 'font', 'text']) ?? themeFile,
  spacing: named(['spacing', 'space', 'layout', 'size']) ?? themeFile,
}

const fontsDir = dirs.find((d) => ['fonts', 'font', 'typefaces'].includes(basename(d))) ?? null

/* ---- brand ---- */
const brandJson = files.find((f) => /(^|\/)(brand|identity)\.json$/.test(rel(f)))
  ?? files.find((f) => basename(f) === 'brand.json')
  ?? null
const brandMd = files.find((f) => /^brand\.md$/i.test(basename(f))) ?? null
const logoDir = dirs.find((d) => ['logo', 'logos', 'mark', 'wordmark', 'marks'].includes(basename(d))) ?? null

/* ---- identity ---- */
const pkg = readJson(join(target, 'package.json'))
const repoUrl = (() => {
  const declared = typeof pkg?.repository === 'string' ? pkg.repository : pkg?.repository?.url
  const clean = (u) => u?.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') ?? null
  if (declared) return clean(declared)
  try {
    /*
      `git remote` walks UP to the enclosing repository. Run against
      fixtures/acme it happily returned 2one's own GitHub URL and wrote it into
      Acme's config — the remote of a repo Acme is merely sitting inside. Only
      trust it when the target IS the repository root.
    */
    const top = execFileSync('git', ['-C', target, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
    if (resolve(top) !== resolve(target)) return null
    return clean(execFileSync('git', ['-C', target, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim())
  } catch { return null }
})()

/*
  The system's name is the ORG, not the artefact. `@acme/design-system` names
  Acme; stripping the scope left "design system", which then became the wordmark
  the checker would forbid agents from typesetting — a generic phrase that would
  reject ordinary prose. The scope is the brand wherever there is one.
*/
const displayName = pkg?.name
  ? (pkg.name.match(/^@([^/]+)\//)?.[1] ?? pkg.name).replace(/[-_]/g, ' ')
  : basename(target)

/* ---- assemble; omit anything not observed ---- */
const paths = {}
const put = (obj, key, p) => { if (p) obj[key] = rel(p) }
if (Object.values(tokenSources).some(Boolean)) {
  paths.tokenSources = {}
  for (const [k, v] of Object.entries(tokenSources)) put(paths.tokenSources, k, v)
}
put(paths, 'theme', themeFile)
put(paths, 'fonts', fontsDir)
put(paths, 'components', componentsDir)
put(paths, 'ownComponents', ownDir)
put(paths, 'blocks', blocksDir)
put(paths, 'barrel', barrel)
if (brandJson || brandMd || logoDir) {
  paths.brand = {}
  put(paths.brand, 'structured', brandJson)
  put(paths.brand, 'prose', brandMd)
  put(paths.brand, 'logo', logoDir)
}

const config = {
  name: displayName,
  ...(pkg?.name ? { packageName: pkg.name } : {}),
  ...(repoUrl ? { repoUrl } : {}),
  paths,
  rules: {
    /*
      `wordmark` is the string the checker forbids agents from typesetting, and
      it is a real editorial decision, not a derivation — a system whose name
      is a common word would reject legitimate prose. The package name is the
      only defensible starting point; the report tells the reader to confirm it.
    */
    wordmark: displayName.split(' ')[0].toLowerCase(),
  },
}

/* ---- the report: three tiers, because they fail differently ---- */
const REQUIRED = [
  ['components', componentsDir, 'nothing to build from — the engine has no component inventory'],
  ['theme / token source', themeFile, 'no token values — every generated colour would be invented'],
]
const RECOMMENDED = [
  ['barrel export', barrel, 'consumers cannot import from the package root'],
  ['brand.json', brandJson, 'no voice, personas or mission — copy will be generic'],
  ['logo directory', logoDir, 'the wordmark rule has no asset to point agents at'],
  ['blocks', blocksDir, 'no page-level templates to compose from'],
]
/*
  The authored layer is the one that cannot be detected, because it does not
  exist until a person writes it. This is the honest part of the report: an
  engine that runs is not a system that governs. Derived data answers "what is
  here"; only these answer "what should I build, and did I build it right".
*/
const AUTHORED = [
  ['rules/ux-rules.json', 'the checker has no rules to enforce — `check` will report no violations because it is not looking'],
  ['graph/ontology.json', 'graph nodes carry no classes, so conformance cannot be checked'],
  ['graph/decisions.json', '`graph-decide` cannot answer "what should I use here"'],
  ['dls.identity.json', 'the manifest falls back to generic prose instead of this system\'s own'],
]
const authoredPresent = (p) => existsSync(join(target, p))

const missingRequired = REQUIRED.filter(([, v]) => !v)
const report = {
  target: target.split(sep).join('/'),
  name: displayName,
  detected: {
    components: componentsDir ? { path: rel(componentsDir), count: tsxIn(componentsDir).length } : null,
    ownComponents: ownDir ? { path: rel(ownDir), count: tsxIn(ownDir).length } : null,
    theme: themeFile ? rel(themeFile) : null,
    tokenSources: paths.tokenSources ?? null,
    brand: paths.brand ?? null,
    blocks: blocksDir ? rel(blocksDir) : null,
    barrel: barrel ? rel(barrel) : null,
    repoUrl,
  },
  missing: {
    required: missingRequired.map(([k, , why]) => ({ what: k, consequence: why })),
    recommended: RECOMMENDED.filter(([, v]) => !v).map(([k, , why]) => ({ what: k, consequence: why })),
    authored: AUTHORED.filter(([p]) => !authoredPresent(p)).map(([what, why]) => ({ what, consequence: why })),
  },
  config,
  written: null,
}

const outFile = join(target, CONFIG_FILE)
if (!dryRun && !missingRequired.length) {
  if (existsSync(outFile) && !flags.has('--force')) {
    report.written = false
    report.note = 'dls.config.json already exists — not overwritten. Re-run with --force to replace it.'
  } else {
    writeFileSync(outFile, JSON.stringify(config, null, 2) + '\n')
    report.written = true
  }
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
} else {
  const d = report.detected
  console.log(`\n  ${displayName} — ${report.target}\n`)
  console.log('  detected')
  console.log(`    components   ${d.components ? `${d.components.path} (${d.components.count})` : '— none found'}`)
  if (d.ownComponents) console.log(`    own          ${d.ownComponents.path} (${d.ownComponents.count})`)
  console.log(`    theme        ${d.theme ?? '— none found'}`)
  console.log(`    brand        ${d.brand?.structured ?? '— none found'}`)
  console.log(`    blocks       ${d.blocks ?? '—'}`)
  console.log(`    barrel       ${d.barrel ?? '—'}`)

  const tier = (label, rows) => {
    if (!rows.length) return
    console.log(`\n  ${label}`)
    for (const r of rows) console.log(`    ! ${r.what.padEnd(22)} ${r.consequence}`)
  }
  tier('blocking — the engine cannot run without these', report.missing.required)
  tier('incomplete — the engine runs, output is weaker', report.missing.recommended)
  tier('not authored — nobody has written these yet (the engine cannot derive them)', report.missing.authored)

  if (report.written === true) console.log(`\n  wrote ${rel(outFile)}`)
  else if (report.written === false) console.log(`\n  ${report.note}`)
  else if (dryRun) console.log(`\n  --dry-run — proposed dls.config.json:\n\n${JSON.stringify(config, null, 2)}\n`)

  if (!missingRequired.length) {
    console.log('\n  next, from the payload root:')
    console.log('    npm run tokens && npm run graph && npm run validate')
    console.log('  then author the layer above — until rules/ux-rules.json exists,')
    console.log('  `2one check` reports no violations because it has nothing to check.\n')
  } else {
    console.log('\n  no config written — resolve the blocking gaps first.\n')
  }
}

process.exit(missingRequired.length ? 1 : 0)
