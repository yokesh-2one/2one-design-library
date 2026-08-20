/*
  Ships the 2one theme + fonts alongside the compiled components.
  Produces:
    dist/styles.css        the theme (2one tokens → shadcn variables) + @font-face
    dist/fonts/*.woff2      the Satoshi font files (referenced by styles.css)
    dist/tokens/*.css       the raw @theme token files (colors/typography/spacing)

  Consumers: `import '@2one/design-library/styles'` once at the app root,
  run Tailwind v4, and `@source` the package's dist so component utilities generate.
*/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

// 1) theme — ship globals.css as the styles entry.
//    Rewrite the dev-relative token imports (../../tokens/) to the packaged
//    location (./tokens/, copied below), so the shipped stylesheet resolves.
const globals = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8').replaceAll(
  '../../tokens/',
  './tokens/',
)
mkdirSync(dist, { recursive: true })
writeFileSync(resolve(dist, 'styles.css'), globals)

// 2) fonts — Satoshi woff2 (styles.css references ./fonts/*)
const fontsSrc = resolve(root, 'src/styles/fonts')
const fontsDist = resolve(dist, 'fonts')
mkdirSync(fontsDist, { recursive: true })
for (const f of readdirSync(fontsSrc)) copyFileSync(resolve(fontsSrc, f), resolve(fontsDist, f))

// 3) raw token files (unchanged)
const tokensDir = resolve(root, 'tokens')
const distTokens = resolve(dist, 'tokens')
mkdirSync(distTokens, { recursive: true })
for (const f of ['colors.css', 'typography.css', 'spacing.css']) {
  copyFileSync(resolve(tokensDir, f), resolve(distTokens, f))
}

console.log('copy-styles: wrote dist/styles.css, dist/fonts/*, dist/tokens/*.css')
