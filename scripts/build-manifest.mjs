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
import { join } from 'node:path'
import { config as cfg } from './lib/config.mjs'

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

const ui = ls(cfg.path('components'), tsx).map(base)
const only = ls(cfg.path('ownComponents'), tsx).map(base)
const blocksDir = cfg.path('blocks')
const blocks = ls(blocksDir, tsx).map(base)
const dashboards = ls(join(blocksDir, 'dashboard-plain'), tsx).length ? ['dashboard-plain'] : []
const charts = ls(join(blocksDir, 'charts'), tsx).map(base)
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
    },
    templates: {
      tier: 3,
      blocks: { path: `${cfg.rel('blocks')}/`, items: blocks.concat(dashboards) },
      charts: { path: `${cfg.rel('blocks')}/charts/`, count: charts.length, items: charts },
      recipes: 'recipes/',
    },
    guide_app: id.guide_app ?? null,
    checks: {
      accessibility: 'npm run a11y (APCA contrast audit)',
      types: 'npm run typecheck',
      token_generation: 'npm run tokens',
      manifest_generation: 'npm run manifest',
      schema_validation: 'npm run validate',
      output_audit: 'npm run check:usage (audits code written WITH the system)',
    },
    schemas: { token: 'schema/token.schema.json', component: 'schema/component.schema.json', config: 'schema/config.schema.json' },
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
          'accent', 'border', 'input', 'ring', 'destructive', 'success']
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
