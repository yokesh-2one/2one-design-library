/*
  Builds the unified "2one Design Library" static webpage into site/.
    site/index.html   → the hub (site-src/index.html)
    site/shadcn/      → the shadcn showcase + knowledge graph (dist-site/)
    site/astryx/      → the Astryx showcase + knowledge graph (astryx/dist/)
  Each stack is built independently (different bundlers) and unified at the static
  layer with a shared "← 2one Library" back-link. No Vercel — serve with `npx serve site`.

  Run: npm run build:library
*/
import { execSync } from 'node:child_process'
import { cpSync, rmSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const site = join(root, 'site')
const run = (cmd, cwd = root) => { console.log(`\n· ${cmd}  (${cwd === root ? '.' : 'astryx'})`); execSync(cmd, { cwd, stdio: 'inherit' }) }

// 1) clean output
rmSync(site, { recursive: true, force: true })
mkdirSync(site, { recursive: true })

// 2) build each stack's static site independently, each based at its mount path
//    (assets are absolute to the subdir, so trailing-slash/cleanUrls can't break them)
run('npx vite build --config vite.config.dev.ts --base=/shadcn/') // shadcn → dist-site/
run('npm run build:site', join(root, 'astryx'))                   // astryx → astryx/dist/ (base /astryx/ via its config)

// 3) hub + fonts
copyFileSync(join(root, 'site-src/index.html'), join(site, 'index.html'))
mkdirSync(join(site, 'fonts'), { recursive: true })
for (const f of ['Satoshi-Medium.woff2', 'Satoshi-Bold.woff2', 'Satoshi-Black.woff2'])
  copyFileSync(join(root, 'src/styles/fonts', f), join(site, 'fonts', f))

// 4) drop the two stacks in
cpSync(join(root, 'dist-site'), join(site, 'shadcn'), { recursive: true })
cpSync(join(root, 'astryx/dist'), join(site, 'astryx'), { recursive: true })

// 5) inject a shared back-to-hub link into each surface (relative to site/<stack>/…)
const pill = '<a href="../index.html" style="position:fixed;left:12px;bottom:12px;z-index:99999;font:500 12px/1 ui-monospace,monospace;background:#09090b;color:#fff;padding:9px 13px;border-radius:999px;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,.28)">← 2one Library</a>'
for (const rel of ['shadcn/index.html', 'shadcn/graph.html', 'astryx/index.html', 'astryx/graph.html']) {
  const file = join(site, rel)
  let s = readFileSync(file, 'utf8')
  if (!s.includes('2one Library')) { s = s.replace('</body>', pill + '</body>'); writeFileSync(file, s) }
}

console.log('\n✓ site/ assembled — hub + shadcn/ + astryx/ (catalogs + graphs).')
console.log('  Serve locally:  npx serve site   (then open http://localhost:3000)')
