/*
  `2one info` — reports the LIVE state of whatever project it is run in.

  A skill written as static prose rots: it described a light-only system for
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
import { join, resolve } from 'node:path'

const cwd = process.cwd()
const asJson = process.argv.includes('--json')
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }
const PKG = '@2one/design-library'

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
    const ui = join(cwd, 'src/components/ui')
    const own = join(cwd, 'src/components')
    const a = existsSync(ui) ? readdirSync(ui).filter((f) => f.endsWith('.tsx')).map((f) => f.replace('.tsx', '')) : []
    const b = existsSync(own) ? readdirSync(own).filter((f) => f.endsWith('.tsx')).map((f) => f.replace('.tsx', '')) : []
    return [...a, ...b].sort()
  }
  const dts = join(installedRoot, 'dist/index.d.ts')
  if (!existsSync(dts)) return []
  const src = readFileSync(dts, 'utf8')
  // The barrel is `export * from './components/ui/<name>'`. Matching only
  // `export { … } from` returned zero here, which a cold test caught — the
  // command reported "0 components" while 57 were installed.
  return [
    ...new Set(
      [...src.matchAll(/export\s+(?:\*|\{[^}]*\})\s+from\s+['"]\.\/components\/(?:ui\/)?([a-z0-9-]+)['"]/g)].map((m) => m[1])
    ),
  ].sort()
})()

// The two silent failures.
const tailwind = deps.tailwindcss ?? (inRepo ? consumerPkg?.devDependencies?.tailwindcss : null)
const tailwindMajor = tailwind ? Number(String(tailwind).replace(/[^\d.]/g, '').split('.')[0]) : null

const cssFiles = ['src/index.css', 'src/app.css', 'src/globals.css', 'app/globals.css', 'styles/globals.css', 'src/styles/globals.css']
  .map((p) => join(cwd, p))
  .filter(existsSync)
const cssText = cssFiles.map((p) => readFileSync(p, 'utf8')).join('\n')
const sourced = inRepo ? true : /@source[^\n]*design-library/.test(cssText)
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
const iconsDirect = deps['lucide-react'] ?? null
let iconsResolvable = false
try { createRequire(join(cwd, 'package.json')).resolve('lucide-react'); iconsResolvable = true } catch { /* not reachable */ }

const problems = []
if (!present) problems.push(`${PKG} is not installed here. Run: npm install ${PKG} react react-dom`)
if (present && !inRepo) {
  if (!tailwindMajor) problems.push('Tailwind not found. The components ship as Tailwind classes and will render unstyled without it.')
  else if (tailwindMajor < 4) problems.push(`Tailwind v${tailwindMajor} found; this library requires v4.`)
  if (!stylesImported) problems.push(`Theme not imported. Add: @import '${PKG}/styles';`)
  if (!sourced) problems.push(`Package not scanned by Tailwind — every class will be tree-shaken and the UI renders unstyled. Add: @source '../node_modules/${PKG}/dist';`)
}

const info = {
  dls: {
    installed: present,
    context: inRepo ? 'inside the DLS repo (use @/ imports from src/)' : 'consuming project (import from the package)',
    version: installedPkg?.version ?? null,
    import: inRepo ? "import { Button } from '@/components/ui/button'" : `import { Button } from '${PKG}'`,
  },
  project: { framework, tailwind: tailwind ?? null, theme_imported: stylesImported, package_scanned_by_tailwind: sourced },
  system: {
    themes: ['light', 'dark'],
    theme_switch: 'wrap the app in the exported ThemeProvider',
    palette: 'grayscale — no brand hue; danger/success for validation state only',
    icons: {
      library: 'lucide-react',
      resolvable: iconsResolvable,
      direct_dependency: iconsDirect,
      note: iconsDirect
        ? `declared directly (${iconsDirect})`
        : iconsResolvable
          ? 'resolvable via the library, but not a direct dependency — add it if you import icons yourself, or a strict installer (pnpm, Yarn PnP) will refuse the import'
          : 'not resolvable — run: npm install lucide-react',
    },
    signature: 'buttons are pills (radius-full)',
    fonts: { heading: 'Satoshi', body: 'Inter' },
  },
  components: { count: components.length, names: components },
  // Blocks are copy-paste templates, not package exports — they import via the
  // `@/` alias, which does not resolve in a consumer. Only report them as local
  // files inside the repo; elsewhere point at the source rather than implying
  // an import that would fail. (A `file:` install symlinks the whole repo, so
  // they LOOK present in a consumer — which is exactly the wrong impression.)
  blocks: inRepo
    ? {
        available_locally: (existsSync(join(cwd, 'src/blocks')) ? readdirSync(join(cwd, 'src/blocks')) : [])
          .filter((f) => f.endsWith('.tsx'))
          .map((f) => f.replace('.tsx', '')),
      }
    : {
        available_locally: [],
        copy_from: 'https://github.com/yokesh-2one/2one-design-library/tree/main/src/blocks',
        note: 'Blocks are templates you copy and adapt, not package exports.',
      },
  problems,
}

if (asJson) {
  console.log(JSON.stringify(info, null, 2))
} else {
  console.log(`\n  2one DLS — ${info.dls.installed ? `v${info.dls.version}` : 'NOT INSTALLED'}`)
  console.log(`  context   ${info.dls.context}`)
  console.log(`  import    ${info.dls.import}`)
  console.log(`  project   ${framework}${tailwind ? ` · tailwind ${tailwind}` : ''}`)
  console.log(`  system    ${info.system.palette}`)
  const icons = info.system.icons
  const iconLabel = icons.direct_dependency
    ? `lucide-react ${icons.direct_dependency}`
    : icons.resolvable
      ? 'lucide-react (via the library — not a direct dep)'
      : 'lucide-react (not resolvable)'
  console.log(`            themes: light + dark · icons: ${iconLabel} · ${info.system.signature}`)
  const nBlocks = info.blocks.available_locally.length
  console.log(`  available ${components.length} components${nBlocks ? `, ${nBlocks} blocks` : ''}`)
  if (problems.length) {
    console.log('\n  problems:')
    for (const p of problems) console.log(`    ! ${p}`)
  }
  console.log('')
}

process.exit(problems.length ? 1 : 0)
