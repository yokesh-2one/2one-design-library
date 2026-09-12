/*
  check-package — every path a consumer-facing script reads must actually ship.

  `files` in package.json is a SECOND, hand-maintained declaration of what the
  engine needs. Nothing reconciled it against what the scripts actually read, so
  it drifted three times, each caught only by someone running the real thing:

    graph/ + rules/      graph-decide shipped but crashed on ENOENT
    dls.config.json      loadConfig fell back to DEFAULTS, so `wordmark` was
                         null and `name` was "design-system" — the wordmark
                         rule searched consumer code for the literal string
                         "design-system" and ignored "2one". A consumer run
                         reported "no violations" while the most brand-critical
                         rule was inert.

  The second is the shape that matters: the command still exited 0. Nothing was
  broken enough to notice, which is why it survived a packaging fix, a CLI fix
  and a full release.

  In-repo these files are simply present, so no amount of testing HERE can find
  it. This check compares the two declarations directly instead.

  Run: npm run check:package   (exits 1 on any path that is read but not shipped)
*/
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, posix } from 'node:path'
import { config as cfg, CONFIG_FILE } from './lib/config.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/*
  The surface a consumer can actually reach: the `bin` entry and what it
  dispatches to, plus the two commands the docs tell consumers to run.
  Maintainer-only scripts (build-graph, build-tokens…) legitimately read src/,
  which must never ship, so they are out of scope by construction rather than
  by an exception list that would rot.
*/
const CONSUMER_FACING = [
  'cli.mjs',
  'dls-info.mjs',
  'check-usage.mjs',
  'graph-decide.mjs',
  'what-uses.mjs',
  'init-payload.mjs',
  'promote-component.mjs',
  'check-rules-compat.mjs',
  'lib/config.mjs',
]

// What npm would actually put in the tarball — asked of npm, not inferred from
// the `files` globs, so a glob that does not match what its author intended is
// still caught.
const shipped = (() => {
  // --ignore-scripts because `prepare` runs the full library build, and its
  // output lands on stdout ahead of the JSON. We only want the file list the
  // `files` globs resolve to, which does not need a build.
  // npm 10 (Node 20, what CI runs) ignores that flag for `prepare` on pack and
  // builds anyway, so stdout can still start with vite's coloured log. Its ANSI
  // escapes contain '[', which is why the JSON is found as the LAST line that
  // opens with an unindented '[': pretty-printed JSON puts one there only at
  // its top level, and the build log always comes before it.
  // shell:true on Windows, since npm is a .cmd shim and execFile cannot spawn it
  // directly on current Node. Every argument here is a literal constant, so
  // there is nothing user-supplied for the shell to re-interpret.
  const out = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', stdio: ['ignore', 'pipe', 'ignore'] },
  )
  const start = out.startsWith('[') ? 0 : out.lastIndexOf('\n[') + 1
  const files = JSON.parse(out.slice(start))[0]?.files ?? []
  return new Set(files.map((f) => f.path.split('\\').join('/')))
})()

const shipsPath = (rel) => {
  const p = rel.split('\\').join('/').replace(/^\.\//, '')
  if (shipped.has(p)) return true
  // a directory ships if anything under it does
  return [...shipped].some((f) => f.startsWith(p.endsWith('/') ? p : p + '/'))
}

/*
  Paths a script reads relative to the PACKAGE root. Deliberately not paths it
  reads relative to cwd — dls-info inspects the CONSUMER's src/ and package.json,
  which are theirs, not ours, and must not be confused for something we ship.
*/
const candidates = new Map() // repo-relative path -> which script wants it

const want = (p, from) => {
  if (!p || p.startsWith('..') || p.includes('node_modules')) return
  const clean = p.split('\\').join('/').replace(/^\.\//, '')
  if (!existsSync(join(root, clean))) return // not a real path in this payload
  if (!candidates.has(clean)) candidates.set(clean, new Set())
  candidates.get(clean).add(from)
}

// 1. Everything the payload config declares as an OUTPUT — these are the
//    generated artefacts the engine reads back at runtime.
for (const key of ['out.manifest', 'out.graph', 'out.tokens', 'out.dtcg']) {
  try { want(cfg.rel(key), 'dls.config.json → paths.' + key) } catch { /* not configured */ }
}
want(CONFIG_FILE, 'lib/config.mjs')
if (cfg.identity !== null) want(cfg.identity ? 'dls.identity.json' : '', 'lib/config.mjs')

// 2. Literal package-relative paths the consumer-facing scripts read.
for (const file of CONSUMER_FACING) {
  const src = readFileSync(join(root, 'scripts', file), 'utf8')
  // join(root, 'x/y.json')  ·  join(root, cfg.rel('k'))  ·  bare 'x/y.json'
  for (const m of src.matchAll(/join\(\s*root\s*,\s*'([^']+)'/g)) want(m[1], file)
  for (const m of src.matchAll(/'((?:graph|rules|tokens|brand|skills|dist)\/[A-Za-z0-9._/-]+)'/g)) want(m[1], file)
}

// 3. graph-decide composes paths from a directory it reads wholesale.
want('graph', 'graph-decide.mjs')
want('rules', 'check-rules.mjs / graph-decide.mjs')

const missing = [...candidates.entries()].filter(([p]) => !shipsPath(p))

if (missing.length) {
  console.error(`\n  ✗ check:package — ${missing.length} path(s) read at runtime but not shipped:\n`)
  for (const [p, who] of missing) {
    console.error(`    ${p}`)
    console.error(`      read by: ${[...who].join(', ')}`)
  }
  console.error(`\n  Add each to "files" in package.json. A consumer command that reads a`)
  console.error(`  missing path either crashes on ENOENT or — worse — falls back to a`)
  console.error(`  default and reports success while checking the wrong thing.\n`)
  process.exit(1)
}

console.log(`\n  ✓ check:package — all ${candidates.size} runtime paths ship (${shipped.size} files in the tarball)\n`)
