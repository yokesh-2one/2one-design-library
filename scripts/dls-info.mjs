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
import { join, resolve } from 'node:path'

const cwd = process.cwd()
const asJson = process.argv.includes('--json')
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }
const PKG = '@yokesh-2one/design-library'

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
  return [...new Set([...src.matchAll(/export\s+\{[^}]*\}\s+from\s+['"]\.\/components\/(?:ui\/)?([a-z0-9-]+)['"]/g)].map((m) => m[1]))].sort()
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
    icons: `lucide-react${deps['lucide-react'] ? ` (${deps['lucide-react']})` : ' (not installed here)'}`,
    signature: 'buttons are pills (radius-full)',
    fonts: { heading: 'Satoshi', body: 'Inter' },
  },
  components: { count: components.length, names: components },
  blocks: existsSync(join(inRepo ? cwd : installedRoot, 'src/blocks'))
    ? readdirSync(join(inRepo ? cwd : installedRoot, 'src/blocks')).filter((f) => f.endsWith('.tsx')).map((f) => f.replace('.tsx', ''))
    : [],
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
  console.log(`            themes: light + dark · icons: ${info.system.icons} · ${info.system.signature}`)
  console.log(`  available ${components.length} components${info.blocks.length ? `, ${info.blocks.length} blocks` : ''}`)
  if (problems.length) {
    console.log('\n  problems:')
    for (const p of problems) console.log(`    ! ${p}`)
  }
  console.log('')
}

process.exit(problems.length ? 1 : 0)
