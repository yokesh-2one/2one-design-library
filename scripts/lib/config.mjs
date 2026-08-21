/*
  The engine/payload seam.

  Every generator and checker in scripts/ previously hardcoded payload paths —
  `tokens/colors.css`, `src/components/ui`, `brand/brand.json`. That is fine for
  one design system and fatal for two: running the same engine against a client's
  repo meant editing the engine.

  This module is the single place a payload describes itself. Scripts ask for
  `cfg.path('components')` instead of naming a directory, so the engine no longer
  contains any knowledge of where 2one keeps its files — or that the payload is
  2one at all.

  Defaults match the current 2one layout exactly, so a repo with no config file
  behaves as it always did. That is deliberate: the seam had to land without a
  flag day, and a missing config should degrade to "the layout we already use"
  rather than an error.
*/
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const engineRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** The 2one layout, used when a payload does not override a key. */
const DEFAULTS = {
  name: 'design-system',
  packageName: null,
  repoUrl: null,
  paths: {
    tokenSources: {
      colors: 'tokens/colors.css',
      typography: 'tokens/typography.css',
      spacing: 'tokens/spacing.css',
    },
    theme: 'src/styles/globals.css',
    fonts: 'src/styles/fonts',
    components: 'src/components/ui',
    ownComponents: 'src/components',
    blocks: 'src/blocks',
    barrel: 'src/index.ts',
    brand: { structured: 'brand/brand.json', prose: 'brand/BRAND.md', logo: 'brand/logo' },
    out: { tokens: 'tokens', manifest: 'manifest.json', graph: 'graph.json', dtcg: 'tokens/tokens.dtcg.json' },
  },
  rules: {
    wordmark: null,
    iconLibrary: 'lucide-react',
    iconLibraryLabel: 'lucide',
    spacingBase: 4,
    grayscaleOnly: false,
    validationHues: [],
    signature: null,
  },
  identity: null,
}

// Shallow-per-branch merge: a payload overriding `paths.brand.logo` should not
// have to restate `paths.brand.structured`.
const merge = (base, over) => {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base
  const out = { ...base }
  for (const [k, v] of Object.entries(over)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? merge(base?.[k] ?? {}, v) : v
  }
  return out
}

/*
  Find the payload the engine was invoked ON, not the one it lives IN.

  The first version defaulted to the engine's own directory, which meant running
  it from a client repo silently operated on 2one's files instead. A fake-payload
  test caught it: the run reported success and had done nothing to the payload it
  was pointed at. Every other tool of this shape (eslint, tsc, prettier) resolves
  from the working directory, and so does this now — walk up from cwd looking for
  a config, and only fall back to the engine's own repo when there is none.
*/
function findPayloadRoot(from = process.cwd()) {
  let dir = resolve(from)
  for (;;) {
    if (existsSync(join(dir, 'dls.config.json'))) return dir
    const parent = dirname(dir)
    if (parent === dir) return engineRoot
    dir = parent
  }
}

/**
 * Load the payload config.
 * @param {string} [root] payload root; defaults to the nearest one above cwd.
 */
export function loadConfig(root = findPayloadRoot()) {
  const file = join(root, 'dls.config.json')
  const raw = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const cfg = merge(DEFAULTS, raw)

  /** Resolve a dotted key from `paths` to an absolute path. */
  const path = (key) => {
    const rel = key.split('.').reduce((o, k) => (o == null ? o : o[k]), cfg.paths)
    if (rel == null) throw new Error(`dls.config.json: no path configured for "${key}"`)
    if (typeof rel !== 'string') throw new Error(`dls.config.json: "${key}" is a group, not a path`)
    return join(root, rel)
  }

  /** The same key as a repo-relative path — for anything user-facing. */
  const rel = (key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), cfg.paths)

  /** Payload identity prose (manifest copy). Absent is valid. */
  const identity = (() => {
    if (!cfg.identity) return null
    const p = join(root, cfg.identity)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  })()

  return { ...cfg, root, path, rel, identity, configured: existsSync(file) }
}

export const config = loadConfig()
