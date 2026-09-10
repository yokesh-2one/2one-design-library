/*
  `2one info` — reports the LIVE state of whatever project it is run in.

  A skill written as static prose rots: it described a single-theme system for
  weeks after dark shipped, and told agents to install from a registry that had
  moved. This command exists so the skill never has to assert a fact it cannot
  observe. The skill says "run this and use what it returns"; the answer is
  always current because it is measured, not remembered.

  Detects: whether the DLS is installed or we are inside the DLS repo itself,
  its version, the available components, the consumer's framework, and the two
  setup mistakes that fail silently (Tailwind v4 missing, or the package not
  @source'd so every class is tree-shaken away).

  Usage: 2one info [--json]
*/
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, resolve, relative, dirname } from 'node:path'

import { config as cfg } from './lib/config.mjs'

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }

/*
  Which design system is this? Read it — do not assume it.

  Everything below used to say "2one": the package name, the grayscale palette
  line, the pill-button signature, the GitHub URL blocks are copied from. Run
  from a project consuming a DIFFERENT payload, the command reported another
  system's facts as if they were theirs. `info` is the one command whose whole
  purpose is to report only what it can observe, so an unobservable constant
  baked into it is precisely the bug it exists to prevent.

  In a consumer, cfg resolves to the installed package's own dls.config.json
  (it ships in `files`), so the engine describes the payload it was installed
  alongside rather than the one it was written for.
*/
const PKG = cfg.packageName ?? '@2one/design-library'
const NAME = cfg.name ?? 'design system'
const themeInfo = cfg.identity?.system?.theme ?? {}
// The @source probe must match the installed directory name under
// node_modules, not the literal "design-library".
const PKG_DIR = PKG.split('/').pop()
const reEscape = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Report the live state of the project at `cwd`: what is installed, how to
 * import it, and what is misconfigured.
 *
 * Everything here is OBSERVED, never assumed, which is the whole point of the
 * command. Taking cwd as a parameter rather than reading process.cwd() at
 * module scope is the same requirement one level up: an embedder asking about
 * one project must not be answered about whichever directory its own host
 * happened to start in.
 *
 * Returns the report. It does not print and it does not exit.
 *
 * @param {object} [opts]
 * @param {string} [opts.cwd] project to inspect
 */
export function dlsInfo({ cwd = process.cwd() } = {}) {
  const consumerPkg = readJson(join(cwd, 'package.json'))
  const deps = { ...(consumerPkg?.dependencies ?? {}), ...(consumerPkg?.devDependencies ?? {}) }

  // Are we inside the DLS repo, or a project consuming it?
  const inRepo = consumerPkg?.name === PKG
  const installedRoot = inRepo ? cwd : join(cwd, 'node_modules', PKG)
  const installedPkg = inRepo ? consumerPkg : readJson(join(installedRoot, 'package.json'))
  const present = Boolean(installedPkg)

  // Component list: from source when in the repo, from the built types otherwise.
  const components = (() => {
    if (inRepo) {
      const ui = cfg.path('components')
      const own = cfg.path('ownComponents')
      const a = existsSync(ui) ? readdirSync(ui).filter((f) => f.endsWith('.tsx')).map((f) => f.replace('.tsx', '')) : []
      const b = existsSync(own) ? readdirSync(own).filter((f) => f.endsWith('.tsx')).map((f) => f.replace('.tsx', '')) : []
      return [...a, ...b].sort()
    }
    const dts = join(installedRoot, 'dist/index.d.ts')
    if (!existsSync(dts)) return []
    const src = readFileSync(dts, 'utf8')
    /*
      The barrel is `export * from './<component-dir>/<name>'`. Matching only
      `export { … } from` returned zero here, which a cold test caught — the
      command reported "0 components" while 57 were installed.

      The directories come from the payload config rather than a literal
      './components/ui', which only described 2one's layout. `src/` is stripped
      because the build flattens it away in dist.
    */
    const distDir = (k) => reEscape(cfg.rel(k).replace(/^src\//, ''))
    const re = new RegExp(
      `export\\s+(?:\\*|\\{[^}]*\\})\\s+from\\s+['"]\\./(?:${distDir('components')}|${distDir('ownComponents')})/([a-z0-9-]+)['"]`,
      'g',
    )
    return [...new Set([...src.matchAll(re)].map((m) => m[1]))].sort()
  })()

  // Resolution is done from the CONSUMER's tree, not the engine's — the engine
  // may live inside node_modules, where its own neighbours are not theirs.
  const requireFromConsumer = createRequire(join(cwd, 'package.json'))

  /*
    Tailwind's presence is a RESOLUTION question, not a package.json one.

    Declaring tailwindcss as a peerDependency means npm now installs it for the
    consumer automatically — but an auto-installed peer lands in node_modules
    WITHOUT being written into the consumer's package.json. Reading `deps` alone
    therefore reports "Tailwind not found" for a tree that has Tailwind installed
    and working, and the suggested cause (legacy-peer-deps) is absent too.

    This is the same conflation already fixed for lucide-react, reintroduced by
    the peerDependency change itself: before it, Tailwind was never auto-installed
    so reading package.json happened to be right. Resolve first, and read the real
    version off the resolved package rather than a declared semver range.
  */
  const tailwindResolved = (() => {
    try { return JSON.parse(readFileSync(requireFromConsumer.resolve('tailwindcss/package.json'), 'utf8')).version }
    catch { return null }
  })()
  const tailwindDeclared = deps.tailwindcss ?? (inRepo ? consumerPkg?.devDependencies?.tailwindcss : null)
  const tailwind = tailwindResolved ?? tailwindDeclared
  const tailwindMajor = tailwind ? Number(String(tailwind).replace(/[^\d.]/g, '').split('.')[0]) : null

  const CSS_CANDIDATES = ['src/index.css', 'src/app.css', 'src/globals.css', 'app/globals.css', 'styles/globals.css', 'src/styles/globals.css']
  const cssFiles = CSS_CANDIDATES.map((p) => join(cwd, p)).filter(existsSync)
  const cssText = cssFiles.map((p) => readFileSync(p, 'utf8')).join('\n')

  /*
    The @source path is resolved relative to the CSS FILE, not the project root,
    so a single hardcoded '../node_modules/…' is wrong for any stylesheet that is
    not exactly one directory deep. Emitting a path the user cannot paste is
    worse than emitting none: it looks authoritative and silently does nothing.
  */
  const cssTarget = cssFiles[0] ?? null
  const sourcePath = cssTarget
    ? `${relative(dirname(cssTarget), join(cwd, 'node_modules')).replaceAll('\\', '/')}/${PKG}/dist`
    : `./node_modules/${PKG}/dist`
  const sourced = inRepo ? true : new RegExp(`@source[^\\n]*${reEscape(PKG_DIR)}`).test(cssText)
  const stylesImported = inRepo ? true : new RegExp(`@import\\s+['"]${PKG.replace('/', '\\/')}\\/styles`).test(cssText)

  const framework = deps.next ? 'next' : deps.vite || deps['@vitejs/plugin-react'] ? 'vite' : deps['react-scripts'] ? 'cra' : deps.react ? 'react' : 'unknown'

  /*
    Icons need two separate facts, and conflating them produced a false statement.
    lucide-react is a real dependency of this library, so npm hoists it and it
    IS importable from a consumer — reporting "not installed here" because it was
    absent from the consumer's own package.json said something untrue about a
    package sitting in node_modules.

    Resolvability is what determines whether an import works today. Being a direct
    dependency is what determines whether it keeps working — hoisting is an npm
    layout detail, and pnpm's strict store or Yarn PnP will refuse the same import.
    Both are worth knowing; they are not the same question.
  */
  const hoistedDependency = (name) => {
    const direct = deps[name] ?? null
    let resolvable = false
    try { requireFromConsumer.resolve(name); resolvable = true } catch { /* not reachable */ }
    return {
      library: name,
      resolvable,
      direct_dependency: direct,
      note: direct
        ? `declared directly (${direct})`
        : resolvable
          ? 'resolvable via the library, but not a direct dependency — add it if you import from it yourself, or a strict installer (pnpm, Yarn PnP) will refuse the import'
          : `not resolvable — run: npm install ${name}`,
    }
  }

  const icons = hoistedDependency(cfg.rules.iconLibrary ?? 'lucide-react')
  // recharts primitives (<BarChart>, <XAxis>, …) are not re-exported by the
  // library's ChartContainer — composing a chart means importing them from
  // recharts directly, the same hoisting trap as icons.
  const charts = hoistedDependency('recharts')

  /*
    These are ONE-TIME project setup, not per-install chores, and saying so is
    part of the message. Read without that framing they look like something npm
    ought to have done and didn't — the first question a real user asked was
    "do I need to install this every time?". npm installs packages; it cannot
    edit your stylesheet, so two of the three can never arrive from an install.
  */
  const problems = []
  if (!present) problems.push(`${PKG} is not installed here. Run: npm install ${PKG} react react-dom`)
  if (present && !inRepo) {
    const where = cssTarget ? relative(cwd, cssTarget).replaceAll('\\', '/') : null
    const inFile = where ? ` in ${where}` : ` in your app stylesheet (looked for: ${CSS_CANDIDATES.join(', ')})`

    if (!tailwindMajor) {
      problems.push(
        `Tailwind v4 not resolvable. It is a peer dependency, so npm normally installs it automatically — ` +
          `if it is absent, an installer that skips peers (legacy-peer-deps, or pnpm/Yarn without auto-install-peers) ` +
          `is the usual cause. Run: npm install -D tailwindcss@4`,
      )
    } else if (tailwindMajor < 4) problems.push(`Tailwind v${tailwindMajor} found; this library requires v4.`)

    if (!stylesImported) problems.push(`One-time setup — add${inFile}:  @import '${PKG}/styles';`)
    if (!sourced) {
      problems.push(
        `One-time setup — add${inFile}:  @source '${sourcePath}';` +
          `  (without it Tailwind tree-shakes every component class and the UI renders unstyled)`,
      )
    }
  }

  const info = {
    dls: {
      installed: present,
      context: inRepo ? `inside the ${NAME} repo (use @/ imports from source)` : 'consuming project (import from the package)',
      version: installedPkg?.version ?? null,
      // The in-repo example points at the payload's own component directory —
      // `@/components/ui/button` is 2one's path, not everyone's.
      import: inRepo
        ? `import { Button } from '@/${cfg.rel('components').replace(/^src\//, '')}/button'`
        : `import { Button } from '${PKG}'`,
    },
    project: { framework, tailwind: tailwind ?? null, theme_imported: stylesImported, package_scanned_by_tailwind: sourced },
    system: {
      themes: themeInfo.modes ?? ['light', 'dark'],
      theme_switch: themeInfo.switch ?? 'wrap the app in the exported ThemeProvider',
      palette:
        themeInfo.hues ??
        (cfg.rules.grayscaleOnly
          ? `grayscale — no brand hue${cfg.rules.validationHues?.length ? `; ${cfg.rules.validationHues.join('/')} for validation state only` : ''}`
          : `see ${cfg.rel('out.tokens')}/colors.json`),
      icons,
      charts,
      signature: cfg.rules.signature ?? null,
      fonts: themeInfo.fonts ?? null,
    },
    components: { count: components.length, names: components },
    // Blocks are copy-paste templates, not package exports — they import via the
    // `@/` alias, which does not resolve in a consumer. Only report them as local
    // files inside the repo; elsewhere point at the source rather than implying
    // an import that would fail. (A `file:` install symlinks the whole repo, so
    // they LOOK present in a consumer — which is exactly the wrong impression.)
    blocks: inRepo
      ? {
          available_locally: (existsSync(cfg.path('blocks')) ? readdirSync(cfg.path('blocks')) : [])
            .filter((f) => f.endsWith('.tsx'))
            .map((f) => f.replace('.tsx', '')),
        }
      : {
          available_locally: [],
          copy_from: cfg.repoUrl ? `${cfg.repoUrl}/tree/main/${cfg.rel('blocks')}` : null,
          note: 'Blocks are templates you copy and adapt, not package exports.',
        },
    problems,
  }

  return info
}

/*
  ---- CLI ----

  Runs only when this file IS the program, so importing the module reports
  nothing and exits nothing.
*/
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const asJson = process.argv.includes('--json')
  const info = dlsInfo()

  if (asJson) {
    console.log(JSON.stringify(info, null, 2))
  } else {
    console.log(`\n  ${NAME} — ${info.dls.installed ? `v${info.dls.version}` : 'NOT INSTALLED'}`)
    console.log(`  context   ${info.dls.context}`)
    console.log(`  import    ${info.dls.import}`)
    console.log(`  project   ${info.project.framework}${info.project.tailwind ? ` · tailwind ${info.project.tailwind}` : ''}`)
    console.log(`  system    ${info.system.palette}`)
    const icons = info.system.icons
    const iconLabel = icons.direct_dependency
      ? `${icons.library} ${icons.direct_dependency}`
      : icons.resolvable
        ? `${icons.library} (via the library — not a direct dep)`
        : `${icons.library} (not resolvable)`
    const sig = info.system.signature ? ` · ${info.system.signature}` : ''
    console.log(`            themes: ${info.system.themes.join(' + ')} · icons: ${iconLabel}${sig}`)
    const nBlocks = info.blocks.available_locally.length
    console.log(`  available ${info.components.count} components${nBlocks ? `, ${nBlocks} blocks` : ''}`)
    if (info.problems.length) {
      console.log('\n  problems:')
      for (const p of info.problems) console.log(`    ! ${p}`)
    }
    console.log('')
  }

  process.exit(info.problems.length ? 1 : 0)
}
