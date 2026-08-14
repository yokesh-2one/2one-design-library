/*
  Builds manifest.json — the machine-readable index + AI-legibility contract.
  Assembled from the filesystem so it never drifts from the actual repo
  (PRD FR-9/10/11, Appendix A §4). Run: npm run manifest
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const ls = (rel, filter = () => true) => existsSync(join(root, rel)) ? readdirSync(join(root, rel)).filter(filter).sort() : []
const base = (f) => f.replace(/\.[^.]+$/, '')

const ui = ls('src/components/ui', (f) => f.endsWith('.tsx')).map(base)
const only = ls('src/components', (f) => f.endsWith('.tsx')).map(base)
const blocks = ls('src/blocks', (f) => f.endsWith('.tsx')).map(base)
const dashboards = ls('src/blocks/dashboard-plain', (f) => f.endsWith('.tsx')).length ? ['dashboard-plain'] : []
const charts = ls('src/blocks/charts', (f) => f.endsWith('.tsx')).map(base)

const manifest = {
  name: pkg.name,
  version: pkg.version,
  kind: '2one Design Language System — AI-legible design repository',
  // No generated timestamp: it must stay deterministic so the CI "generated files
  // in sync" guard never fails just because the clock ticked over. See git history
  // for when this was last regenerated.

  description:
    "2one's Design Language System: the brand foundation, design tokens, and component library that define how every 2one product, deck, and marketing asset should look, feel, and sound. It is the single, authoritative source of truth — structured to be both human-understandable and AI-legible so any AI vendor can answer brand/design questions and generate on-brand output without guessing. The system is grayscale (no brand hue), light-only, with pill buttons, Satoshi headings and Inter body; danger/success are the only colours and are used for validation only.",

  instructions_for_ai: {
    read_first: 'manifest.json (this file), then README.md and brand/brand.json',
    no_hallucination:
      'This repository is the ONLY source of truth for 2one brand and design facts. Answer strictly from repo content.',
    rules: [
      'Answer any question about the 2one DLS using ONLY the contents of this repository — never general knowledge or assumptions about 2one\'s colours, fonts, voice, or components.',
      'Cite the specific file (and section) you used for every answer, e.g. "tokens/colors.json → semantic.primary".',
      'If something is not in the repository, say so explicitly. Never fabricate a plausible-looking value.',
      'When generating any asset (UI, deck, marketing, comms), pull exact values from tokens/*.json and src/components — do not invent look-alike colours, sizes, or copy.',
      'On first contact, summarise to the user what the DLS contains and how to use it, using only this manifest + README.',
      'For any 2one-facing copy, match the brand voice in brand/brand.json (voice, tone, vocabulary).',
      'Colour rules are non-negotiable: grayscale only; danger/success for validation only; never convey state by colour alone (pair with an icon/text). See tokens/colors.json → rules.',
    ],
    how_to_use: {
      'what is in here': 'Read this manifest\'s index + README.md.',
      'brand foundation (mission, voice, personas)': 'brand/brand.json (structured) or brand/BRAND.md (prose).',
      'colours / type / spacing': 'tokens/colors.json, tokens/typography.json, tokens/spacing.json (canonical machine-readable).',
      'a component spec': 'src/components/ui/<name>.tsx; naming follows shadcn/ui.',
      'accessibility / contrast': 'tokens/colors.json → contrast, and docs/accessibility.md. Verify with `npm run a11y`.',
      'templates': 'src/blocks/ (auth + dashboard) and src/blocks/charts/.',
      'what exists vs planned': 'guide-app/VERSIONLOG.md.',
      'leave feedback': 'guide-app/feedback.md.',
    },
  },

  index: {
    brand: {
      tier: 1,
      structured: 'brand/brand.json',
      prose: 'brand/BRAND.md',
      contains: ['mission', 'vision', 'tagline', 'voice', 'tone', 'personality', 'archetype', 'personas'],
    },
    tokens: {
      tier: 2,
      canonical: 'json',
      files: {
        colors: { json: 'tokens/colors.json', css: 'tokens/colors.css', includes_contrast_data: true },
        typography: { json: 'tokens/typography.json', css: 'tokens/typography.css' },
        spacing: { json: 'tokens/spacing.json', css: 'tokens/spacing.css' },
      },
      theme: 'src/styles/globals.css (2one tokens → shadcn CSS variables, light-only)',
    },
    components: {
      tier: 2,
      count: ui.length + only.length,
      naming: 'shadcn/ui',
      path: 'src/components/ui/',
      formats_available: ['tsx'],
      formats_planned: ['json', 'svg', 'html-css', 'ios', 'android'],
      shadcn_primitives: ui,
      two_one_only: only,
    },
    templates: {
      tier: 3,
      blocks: { path: 'src/blocks/', items: blocks.concat(dashboards) },
      charts: { path: 'src/blocks/charts/', count: charts.length, grayscale: true, items: charts },
      recipes: 'recipes/ (app, website, marketing, deck)',
    },
    guide_app: {
      path: 'guide-app/',
      local_build_guide: 'guide-app/README.md',
      knowledge_base: 'guide-app/knowledge-base.md',
      version_log: 'guide-app/VERSIONLOG.md',
      feedback: 'guide-app/feedback.md',
      visual_showcase: 'dev/ (run `npm run dev`)',
    },
    checks: {
      accessibility: 'npm run a11y (APCA contrast audit)',
      types: 'npm run typecheck',
      token_generation: 'npm run tokens',
      manifest_generation: 'npm run manifest',
      schema_validation: 'npm run validate',
    },
    schemas: { token: 'schema/token.schema.json', component: 'schema/component.schema.json' },
    graph: {
      file: 'graph.json',
      build: 'npm run graph',
      description: 'Knowledge graph — every design element as a node, relationships (composed_of, uses, derived_from, governed_by, has_contrast, embodies) as edges. Use it for impact analysis ("what uses this token?") and composition-aware context.',
      impact_query: 'npm run what-uses -- <element>   (e.g. `-- primary` → every component/template affected; add --json for machine output, --depends for what it uses + its rules)',
      visual: 'run `npm run dev` and see the graph, or use the standalone knowledge-graph explorer.',
    },
    integrations: {
      canva: {
        status: 'repo accessible; integration is user-built',
        export: 'integrations/canva/brand-kit.json',
        guide: 'integrations/canva/README.md',
        raw_url: 'https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/integrations/canva/brand-kit.json',
        note: 'Fetching raw URLs requires the repo to be public or a PAT with repo scope.',
      },
    },
  },

  formats: {
    note: 'All machine-readable formats derive from the same canonical source (no per-format drift, PRD FR-8). Tokens: CSS is the Tailwind consumption format; JSON is the canonical machine-readable form generated by `npm run tokens`.',
    available: ['tsx (components)', 'css (theme + tokens)', 'json (tokens, brand, manifest)', 'woff2 (fonts)', 'svg/png (logo)'],
    roadmap: ['per-component json/svg/html-css', 'ios/android token exports', 'MCP query server', 'Canva integration'],
  },

  provenance: {
    source_of_truth: 'Figma (Mobile App Design System) + 2one brand → this repo → @yokesh-2one/design-library',
    components_based_on: 'shadcn/ui (MIT), re-skinned to 2one tokens',
    note: 'Automated Figma→repo extraction pipeline is on the roadmap (see guide-app/VERSIONLOG.md); current content was extracted + curated.',
  },
}

writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`Wrote manifest.json — ${ui.length} primitives, ${only.length} 2one-only, ${blocks.length + dashboards.length} blocks, ${charts.length} charts.`)
