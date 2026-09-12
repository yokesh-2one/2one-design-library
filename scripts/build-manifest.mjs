/*
  Builds manifest.json — the machine-readable index + AI-legibility contract.

  ENGINE. Contains no knowledge of which design system it is describing.
  Everything specific to a payload comes from two places:

    dls.config.json    where files live, and the four rule parameters
    dls.identity.json  the prose — description, instructions_for_ai, conventions,
                       provenance, history

  Before the seam, 16% of this file was 2one copy (Satoshi, pill buttons,
  "grayscale only", the shadcn provenance). Running it against a client's repo
  would have produced a manifest telling their AI about 2one's fonts.

  Structure is still derived from the filesystem, so the index cannot drift from
  the actual contents. Run: npm run manifest
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { config as cfg } from './lib/config.mjs'
import { extractVariants } from './lib/extract-variants.mjs'

const root = cfg.root
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const colors = JSON.parse(readFileSync(join(cfg.path('out.tokens'), 'colors.json'), 'utf8'))
const id = cfg.identity ?? {}

const ls = (abs, filter = () => true) => (existsSync(abs) ? readdirSync(abs).filter(filter).sort() : [])
const base = (f) => f.replace(/\.[^.]+$/, '')
const tsx = (f) => f.endsWith('.tsx')

// Assets are only usable by an agent that never clones the repo if they carry an
// absolute URL, so every asset entry is emitted fully qualified.
const RAW = cfg.repoUrl ? `${cfg.repoUrl.replace('https://github.com/', 'https://raw.githubusercontent.com/')}/main/` : ''

/*
  Some payload-authored primitives live alongside the upstream ones (2one's
  Toolbar sits in components/ui because that is where a consumer expects it,
  but shadcn has no equivalent). Counting it as an upstream primitive would
  overstate what was inherited, so the config names them and they are reported
  under `own` instead.
*/
const ownInUi = new Set(cfg.rules.ownComponentsInUi ?? [])
const uiAll = ls(cfg.path('components'), tsx).map(base)
const ui = uiAll.filter((n) => !ownInUi.has(n))
const only = [...ls(cfg.path('ownComponents'), tsx).map(base), ...uiAll.filter((n) => ownInUi.has(n))].sort()

/*
  cva variant enums per component — the mechanical slice of a prop contract that
  an agent most often opens source for (which `variant`/`size` exist + defaults).
  Keyed by component slug, matching the graph's component:<slug> ids. Full prop
  types stay a planned format; this covers the highest-frequency question now.
*/
const componentFiles = [
  ...ls(cfg.path('components'), tsx).map((f) => [base(f), join(cfg.path('components'), f)]),
  ...ls(cfg.path('ownComponents'), tsx).map((f) => [base(f), join(cfg.path('ownComponents'), f)]),
]
const variants = {}
for (const [slug, abs] of componentFiles) {
  try {
    const v = extractVariants(readFileSync(abs, 'utf8'))
    if (v) variants[slug] = v
  } catch { /* unreadable file → skip */ }
}

/*
  The PUBLIC SYMBOLS a consumer may import, not the file names.

  These differ by roughly 5x: 57 component files export ~290 symbols, because
  one file ships a family (card.tsx → Card, CardHeader, CardTitle, CardContent,
  CardFooter, CardAction, CardDescription). Any check that treats the file list
  as the API therefore rejects most correct imports — CardHeader would read as
  invented — which is the fastest way to get a checker switched off.

  Emitted here, rather than parsed at check time, because the source tree does
  not ship: `files` carries dist/ and manifest.json, never src/. Generating it
  into the manifest means the same list is available in-repo and in a consumer,
  it is drift-guarded by check:meta like everything else here, and the engine
  keeps no opinion about TypeScript — a payload on another stack populates this
  however its own language requires.
*/
const exportedSymbols = (() => {
  const out = new Set()
  const barrel = cfg.path('barrel')
  if (!existsSync(barrel)) return []
  const barrelDir = dirname(barrel)
  const barrelSrc = readFileSync(barrel, 'utf8')

  const collect = (file) => {
    if (!existsSync(file)) return
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_$]+)/g)) out.add(m[1])
    for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const part of m[1].split(',')) {
        // `export { type CarouselApi }` and `export { x as Y }` — take the
        // exported name, and drop an inline `type` qualifier rather than
        // letting it become part of the identifier.
        const name = part.trim().split(/\s+as\s+/).pop()?.trim().replace(/^type\s+/, '')
        if (name && /^[A-Za-z_$][\w$]*$/.test(name)) out.add(name)
      }
    }
  }

  /*
    Follow the BARREL, not a directory listing. The barrel is the definition of
    the public API — a first pass walked the two component directories instead
    and missed ThemeProvider, which the barrel re-exports from outside both, so
    a correct import of it was reported as unknown.
  */
  for (const m of barrelSrc.matchAll(/export\s+(?:\*|\{[^}]*\})\s+from\s+['"](\.[^'"]+)['"]/g)) {
    const rel = m[1]
    for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
      const candidate = join(barrelDir, rel + ext)
      if (existsSync(candidate)) { collect(candidate); break }
    }
  }
  collect(barrel) // anything the barrel declares directly
  return [...out].sort()
})()
const blocksDir = cfg.path('blocks')
const blocks = ls(blocksDir, tsx).map(base)
const dashboards = ls(join(blocksDir, 'dashboard-plain'), tsx).length ? ['dashboard-plain'] : []
const charts = ls(join(blocksDir, 'charts'), tsx).map(base)
const marketing = ls(join(blocksDir, 'marketing'), tsx).map(base)

// Page patterns (Tier 3): complete, opinionated compositions in src/patterns, each
// with a machine-readable spec in rules/patterns/<name>.json (purpose / when-not /
// composition / primary action / a11y / anti-patterns). Indexed here so an agent
// finds a whole-page answer the same way it finds a component.
const patternsDir = cfg.path('patterns')
const patternSpecsDir = cfg.path('patternSpecs')
const patterns = ls(patternsDir, tsx).map(base)
const patternSpecs = ls(patternSpecsDir, (f) => f.endsWith('.json'))
  .map((f) => { try { return JSON.parse(readFileSync(join(patternSpecsDir, f), 'utf8')) } catch { return null } })
  .filter(Boolean)

// Assistant elements (Tier 3): complete, opinionated pieces for a single
// AI-product interface state (reasoning, tool calls, refusals …), each in
// src/ai-components with a machine-readable spec in rules/ai-components/<name>.json.
// Indexed here so an agent finds a whole assistant-state answer the same way it
// finds a component — with its grounding, governing rules and assumptions attached.
const assistantDir = cfg.path('aiComponents')
const assistant = ls(assistantDir, tsx).map(base)
const assistantSpecs = ls(cfg.path('aiComponentSpecs'), (f) => f.endsWith('.json'))
  .map((f) => { try { return JSON.parse(readFileSync(join(cfg.path('aiComponentSpecs'), f), 'utf8')) } catch { return null } })
  .filter(Boolean)

// The payload's machine-readable UX-rules contract, when it ships one. Indexed
// here so an agent finds the rules the same way it finds tokens — and so the
// counts in the manifest cannot disagree with the rules file itself.
const uxRules = (() => {
  const p = join(root, cfg.rel('rules'))
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
})()
const logoDir = cfg.path('brand.logo')

const wordmark = cfg.rules.wordmark ?? cfg.name
const logoSvgs = ls(join(logoDir, 'svg'), (f) => f.endsWith('.svg'))
const variantOf = (f) => base(f).replace(new RegExp(`^${wordmark}-logo-`), '')

const manifest = {
  name: pkg.name,
  version: pkg.version,
  kind: `${cfg.name} Design Language System — AI-legible design repository`,
  // Deterministic, not a wall-clock date, so regenerating on any day is a no-op
  // and `npm run check:meta` stays honest.
  generated_for: pkg.version,

  description: id.description ?? `${cfg.name} design system.`,

  instructions_for_ai: id.instructions_for_ai ?? {},

  index: {
    brand: {
      tier: 1,
      structured: cfg.rel('brand.structured'),
      prose: cfg.rel('brand.prose'),
      contains: id.brand_contains ?? [],
      logo: {
        rules: `${cfg.rel('brand.logo')}/manifest.json`,
        component: `${cfg.rel('ownComponents')}/logo.tsx (React consumers only)`,
        critical: id.logo_rules ?? null,
        svg: Object.fromEntries(logoSvgs.map((f) => [variantOf(f), `${RAW}${cfg.rel('brand.logo')}/svg/${f}`])),
        png: Object.fromEntries(
          ls(join(logoDir, 'png'), (f) => f.endsWith('.png')).map((f) => [
            base(f).replace(new RegExp(`^${wordmark}-logo-`), ''),
            `${RAW}${cfg.rel('brand.logo')}/png/${f}`,
          ])
        ),
      },
    },
    assets: {
      note: 'Every non-code asset this repo serves, with a fetchable URL. Standalone output (HTML artifact, deck, social image) must embed these rather than substituting text or a system font — that is the most common way generated output silently goes off-brand.',
      logo: logoSvgs.map((f) => ({
        id: `logo-${variantOf(f)}`,
        type: 'image/svg+xml',
        url: `${RAW}${cfg.rel('brand.logo')}/svg/${f}`,
        usage: `Wordmark, ${variantOf(f)} variant. Embed inline; never retype as text.`,
      })),
      fonts: ls(cfg.path('fonts'), (f) => f.endsWith('.woff2')).map((f) => ({
        id: base(f),
        type: 'font/woff2',
        url: `${RAW}${cfg.rel('fonts')}/${f}`,
        usage: 'Self-hosted heading font, on no CDN. Standalone output must embed this or declare the fallback it used.',
      })),
      body_font: id.system?.theme?.fonts?.body
        ? { family: id.system.theme.fonts.body, usage: 'Body and UI text.' }
        : null,
      icons: {
        library: cfg.rules.iconLibraryLabel,
        package: `${cfg.rules.iconLibrary}@${pkg.dependencies?.[cfg.rules.iconLibrary] ?? 'latest'}`,
        react: `import { Rocket } from '${cfg.rules.iconLibrary}'  —  <Button><Rocket /> Launch</Button>`,
        browse: `https://${cfg.rules.iconLibraryLabel}.dev/icons`,
        rule: `${cfg.rules.iconLibraryLabel} ONLY. Never mix in a second icon set — it is one of the most visible "AI-generated" tells. Icons inherit currentColor and default to size-4 inside a Button.`,
      },
      absent: id.absent_categories ?? null,
    },
    tokens: {
      tier: 2,
      canonical: 'json',
      files: {
        colors: { json: `${cfg.rel('out.tokens')}/colors.json`, css: cfg.rel('tokenSources.colors'), includes_contrast_data: true },
        typography: { json: `${cfg.rel('out.tokens')}/typography.json`, css: cfg.rel('tokenSources.typography') },
        spacing: { json: `${cfg.rel('out.tokens')}/spacing.json`, css: cfg.rel('tokenSources.spacing') },
        dtcg: {
          json: cfg.rel('out.dtcg'),
          format: 'W3C Design Tokens Community Group',
          purpose:
            'Neutral interchange format for design tooling and non-web platforms. Groups: color (primitive ramps), light/dark (semantic sets, apply one at a time), font, text (composite typography → Figma text styles), dimension (px). Semantic tokens alias their ramp step. Import via Tokens Studio (Figma) or Style Dictionary (other platforms).',
        },
      },
      theme: cfg.rel('theme'),
    },
    components: {
      tier: 2,
      count: ui.length + only.length,
      naming: id.system?.conventions?.naming ?? null,
      path: `${cfg.rel('components')}/`,
      formats_available: ['tsx'],
      formats_planned: ['json', 'svg', 'html-css', 'ios', 'android'],
      primitives: ui,
      own: only,
      // Every symbol importable from the package barrel — the API surface, as
      // opposed to `primitives`/`own`, which are the files behind it.
      exports: exportedSymbols,
      // The cva variant enums (+ defaults) per component slug — so an agent can
      // pick a correct `variant`/`size` without opening the component source.
      variants,
    },
    templates: {
      tier: 3,
      blocks: { path: `${cfg.rel('blocks')}/`, items: blocks.concat(dashboards) },
      marketing: { path: `${cfg.rel('blocks')}/marketing/`, items: marketing },
      charts: { path: `${cfg.rel('blocks')}/charts/`, count: charts.length, items: charts },
      patterns: {
        path: `${cfg.rel('patterns')}/`,
        specs: `${cfg.rel('patternSpecs')}/`,
        note: `Complete, opinionated PAGE compositions — the ${cfg.name} answer for a whole screen. Adapt the content, keep the structure. Each carries a machine-readable spec and a graph node (pattern:<id>).`,
        items: patterns,
        spec: patternSpecs,
      },
      aiComponents: {
        path: `${cfg.rel('aiComponents')}/`,
        specs: `${cfg.rel('aiComponentSpecs')}/`,
        note: `Complete, opinionated pieces for a single assistant/AI-product interface state — the ${cfg.name} answer for reasoning, tool calls, refusals and the rest. Adapt the content, keep the structure. Each carries a machine-readable spec and a graph node (ai-component:<id>). Concept inspired by assistant-ui's Elements; composed only from real ${cfg.name} primitives.`,
        count: assistant.length,
        items: assistant,
        spec: assistantSpecs,
      },
      recipes: 'recipes/',
    },
    ...(uxRules
      ? {
          rules: {
            file: cfg.rel('rules'),
            count: uxRules.rules?.length ?? 0,
            version: uxRules.version ?? null,
            severity_levels: Object.keys(uxRules.severity_levels ?? {}),
            precedence: uxRules.precedence?.order ?? [],
            validate: 'npm run check:rules',
          },
        }
      : {}),
    guide_app: id.guide_app ?? null,
    checks: {
      accessibility: 'npm run a11y (APCA contrast audit)',
      types: 'npm run typecheck',
      token_generation: 'npm run tokens',
      manifest_generation: 'npm run manifest',
      schema_validation: 'npm run validate',
      output_audit: 'npm run check:usage (audits code written WITH the system)',
    },
    schemas: Object.fromEntries(['token', 'component', 'config'].map((k) => [k, `${cfg.rel('schemas')}/${k}.schema.json`])),
    graph: {
      file: cfg.rel('out.graph'),
      build: 'npm run graph',
      description:
        'Knowledge graph — every design element as a node, relationships (composed_of, uses, derived_from, governed_by, has_contrast, embodies) as edges. Use it for impact analysis ("what uses this token?") and composition-aware context.',
      impact_query: 'npm run what-uses -- <element>   (add --json for machine output, --depends for what it uses + its rules)',
    },
    integrations: id.integrations ?? null,
  },

  system: {
    ...(id.system ?? {}),
    theme: {
      ...(id.system?.theme ?? {}),
      // Derived, never typed by hand. A hand-written copy of this map was wrong
      // about 3 of the 7 values it listed before it was folded in from registry.json.
      tokenMap: Object.fromEntries(
        ['background', 'foreground', 'primary', 'primary-foreground', 'secondary', 'muted', 'muted-foreground',
          'accent', 'brand', 'border', 'input', 'ring', 'destructive', 'success']
          .filter((k) => colors.semantic[k])
          .map((k) => [`--${k}`, colors.semantic[k]])
      ),
    },
  },

  formats: {
    note: 'All machine-readable formats derive from the same canonical source, so there is no per-format drift. CSS is the Tailwind consumption format; JSON is the canonical machine-readable form.',
    available: ['tsx (components)', 'css (theme + tokens)', 'json (tokens, brand, manifest)', 'woff2 (fonts)', 'svg/png (logo)'],
    roadmap: id.formats_roadmap ?? [],
  },

  provenance: id.provenance ?? null,
}

writeFileSync(join(root, cfg.rel('out.manifest')), JSON.stringify(manifest, null, 2) + '\n')
console.log(
  `Wrote ${cfg.rel('out.manifest')} — ${ui.length} primitives, ${only.length} ${cfg.name}-only, ${blocks.length + dashboards.length} blocks, ${charts.length} charts.`
)
