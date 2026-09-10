# Changelog

All notable changes to `@2one/design-library` are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Brand accent — `#30A1FF`.** The system gains a single brand accent (the first
  brand hue), used for emphasis only: links, the focus ring, and selection/active
  indicators. Introduced as the `brand` ramp ([`tokens/colors.css`](tokens/colors.css))
  and the semantic `--brand` token ([`src/styles/globals.css`](src/styles/globals.css)),
  exposed to Tailwind as `--color-brand` (`text-brand`, `border-brand`, `ring-brand`).
  Recorded as a brand fact in [`brand/brand.json`](brand/brand.json) → `color.accent`.
- **New UX rule `brand-accent`** ([`rules/ux-rules.json`](rules/ux-rules.json)):
  the accent is for emphasis only — never the primary fill, never the sole carrier
  of state — bringing the machine-readable rule count to 33.
- **Accent wired into the idiomatic surfaces** (primary stays grayscale): the
  `link` button variant, the checked state of `Checkbox` / `RadioGroup` / `Switch`,
  the active `Tabs` (line variant) underline, and the active `Sidebar` item's
  left-bar now render the brand accent. Added `--brand-foreground` (the tick/knob on
  a brand fill) with its own audited pair.
- **New components — `MediaPlaceholder` and the `AppShell` pattern.** `MediaPlaceholder`
  is the sanctioned, on-brand "no image yet" surface (a muted, aspect-ratio-held panel
  with a lucide glyph), so image-first apps stop hand-rolling one. `AppShell`
  ([`src/patterns/app-shell.tsx`](src/patterns/app-shell.tsx)) is a responsive product
  frame — a desktop `Sidebar` and a mobile branded `AppBar` + bottom nav driven by the
  same destinations. Component count is now 59.
- **`AppBar` gains a `brand` slot** — a first-class home for the wordmark in product chrome.
- **`SidebarClose`** — an in-menu close (X); `SidebarTrigger` hides while the menu is open,
  so the close control lives inside the panel.
- **Domain page patterns** — `feed-item`, `profile-header`, `comment-thread` and
  `media-gallery` ([`rules/patterns/`](rules/patterns)), so `graph-decide` answers
  social/product intents, not only canonical ones.
- **Per-component variant metadata in the manifest** — the cva `variant` / `size` enums
  are emitted, so an agent can pick a variant without opening the source.
- **A Changelog page** in the showcase, rendered live from this file.
- **Consumer on-ramp** — [`docs/consuming.md`](docs/consuming.md) (install + the Tailwind
  `@source` wiring) is surfaced from the manifest-first entry points, with a tested
  compatibility matrix.
- **New audit coverage** — mechanised detectors `fixed-vs-theme-color` and `logo-in-button`,
  new guards `check:pill` / `check:logo-sizing` / `check:docs`, and a `--draft` review
  checklist for the "must" rules a static run can't judge.
- **Anti-slop rules** ([`rules/ux-rules.json`](rules/ux-rules.json) → v1.3.0): two new rules
  and their `check-usage` detectors — `hero-badge-cliche` / `badge-above-h1` (no pill Badge
  stacked directly above a hero H1) and `copy-em-dash` / `em-dash-overuse` (copy that leans
  on the em-dash). Born from an audit against the known tells of AI-generated design: the
  token layer already resisted them, so the composition and copy layers are now governed too.

### Changed
- **Colour foundation is now three explicit levels: Primary (neutral) · Accent
  (brand, #30A1FF) · Semantic (danger/success).** The vestigial grayscale `accent`
  ramp (a duplicate of `neutral`, imported from shadcn/Figma and used nowhere) was
  removed; the ramps are now `neutral`, `brand`, `danger`, `success`. shadcn's
  semantic `--accent`/`--accent-foreground` hover-surface tokens remain in
  `globals.css` as a component concern (not a brand colour level).
- **`grayscale` is now "grayscale foundation + one brand accent".** The system is
  no longer strictly hue-free: structure and primary actions stay grayscale, and the
  one accent (`--brand`) carries emphasis. The `grayscale` rule, the token rules, and
  the docs/manifest/AI-entry copy were updated to match; `danger`/`success` remain
  validation-only.
- **Focus ring is now the brand accent.** `--ring` / `--sidebar-ring` render the
  accent (`#1670c9` light, `#7cc4ff` dark) instead of neutral grey.
- **Accessibility:** `#30A1FF` is too light to clear the APCA audit as text or as a
  solid fill, so `--brand` renders APCA-accessible steps of the identity hue
  (`brand-700 #1670c9` on light, `brand-300 #7cc4ff` on dark). The `npm run a11y`
  matrix gains brand-accent-text pairs, audited in both themes.
- **Crush-proof `Logo`.** The wordmark's dimensions are applied inline, so an ancestor
  utility (e.g. a `Button`'s icon-sizing rule) can't distort the 109:33 mark. The pill
  signature is also re-asserted on Radix `asChild` triggers, so a `Button` used as a
  trigger stays a pill.
- **Showcase.** A single global Help menu, "Components for AI Interface" folded into the
  Components page as a section, a responsive mobile nav, and a knowledge graph that works
  on touch — all bilingual (EN + FR).
- **Marketing templates de-slopped.** The hero is now a left-aligned two-column lockup
  (no badge-above-H1); the feature grid is a left-aligned list with inline icons (not
  centred icon-on-top cards); the stats band is framed and left-aligned (not a centred
  number row); and a copy pass cut the em-dash density across the blocks. This closes the
  four composition/copy tells the anti-slop audit surfaced.

### Fixed
- **`login-05` logo invisible in dark.** The block shipped a single black `Logo` on the
  theme surface; it is now theme-adaptive (a `.dark` variant swap). The new
  `fixed-vs-theme-color` detector guards against the regression.
- **Docs imported the wrong package name.** [`docs/building-with-the-dls.md`](docs/building-with-the-dls.md)
  imported `@yokesh-2one/design-library` while the package is `@2one/design-library` — the
  documented example would have failed `npx 2one check`. Corrected and guarded by `check:docs`.
- **Knowledge graph unusable on mobile.** The floating panels covered the canvas and it was
  mouse-only; panels now dock as sheets and the canvas supports touch pan / pinch-zoom.

## [0.2.0] - 2026-08-24

First tagged release. `0.1.0` was written up below but never tagged, so this is
the first version a consumer can actually pin.

### Added
- **Knowledge graph → AI decision engine.** The graph is now a semantic *decision*
  graph, not just a dependency graph. New authored decision layer
  ([`graph/decisions.json`](graph/decisions.json)) adds intents, contexts, states,
  accessibility requirements, and button variants, plus decision edges
  (`preferred_for`, `preferred_over`, `inappropriate_for`, `requires`,
  `supports_state`, `preferred_composition`, `realized_by`, …). A formal ontology
  ([`graph/ontology.json`](graph/ontology.json)) types every node/edge and the
  conflict-precedence ladder; `build-graph.mjs` now sources rules from
  [`rules/ux-rules.json`](rules/ux-rules.json) (severity + category) and tags every
  node/edge with an ontology class + provenance (`explicit`/`derived`).
- Deterministic reasoning layer [`scripts/graph-decide.mjs`](scripts/graph-decide.mjs)
  (`npm run graph:decide`): `decide <intent> [--context]`, `check`, `rules`,
  `alternatives`, `incompatible`, `a11y`, `states`, `why`.
- Graph guarantees: `npm run graph:validate` (ontology conformance, provenance,
  cycles, coverage) and `npm run graph:test` (deterministic decision tests) — both
  wired into `npm run verify`. Architecture: [`docs/knowledge-graph.md`](docs/knowledge-graph.md);
  agent protocol in `AGENTS.md`.
- `LICENSE` (MIT) and a `license` field in `package.json` — the package can now
  be distributed unambiguously.
- CI workflow (`.github/workflows/ci.yml`): typecheck, public-API completeness,
  data validation, accessibility thresholds, generated-file sync, and library build.
- `scripts/check-exports.mjs` (`npm run check:exports`) — guards that every
  component is re-exported from `src/index.ts`.
- `npm run check:meta` — fails if the generated `tokens/*.json`, `manifest.json`,
  or `graph.json` drift from their sources.
- `engines.node >= 18`.
- `docs/building-with-the-dls.md` — consistency rules for building on the DLS.
- `scripts/check-claims.mjs` (`npm run check:claims`) — fails the build if a stale
  capability claim (e.g. a single-theme claim after dark shipped) survives in any
  tracked prose/config. Wired into `npm run validate` and CI. Seeded from the real
  drift found after dark mode shipped, so the same class of drift can never return.
- "Definition of Done for a capability change" section in
  `docs/building-with-the-dls.md` (near rule 15): run `check:claims` and grep the old
  claim repo-wide in the same PR.
- **Knowledge-graph dependency edges.** Each component now has `depends_on` edges to the
  external npm packages it imports (13 `package` nodes, 78 edges), so
  `npm run what-uses recharts` answers the flagship bundle-impact question — it reports
  the `Chart` component plus all 31 chart templates and `dashboard-plain`.
- **Governance coverage.** Every interactive component is now `governed_by`
  `rule:no-color-alone` (governed_by edges 33 → 51). `npm run validate` fails if any
  interactive component (`scripts/interactive-components.mjs`, the single source of truth)
  lacks that edge.
- `check:claims` now also forbids hard-coded graph counts (`N nodes` / `N edges`) in prose.
- **`Toolbar` + `ToolbarSpacer`** (`src/components/ui/toolbar.tsx`) — a horizontal action
  container that **wraps** (`flex-wrap`) and never uses `overflow-x-auto`, so critical
  actions (a Leave / Close button) can't be clipped at narrow widths. Exported, shown in
  the dev showcase, and in the knowledge graph.
- **`--scrim` token** (`bg-scrim` / `from-scrim`) for text placed over images/video, plus a
  "text over media" section in `docs/accessibility.md`: the APCA audit only checks token
  pairs and can't see media, so always lay a scrim behind such text.
- Exported **`useIsMobile`** — needed for the responsive-panel pattern.
- Surfaced **`AvatarGroup` / `AvatarGroupCount`** in the component index (they were exported
  but undiscoverable).
- `docs/building-with-the-dls.md` rules 17–19: change colour via `variant` not a `className`
  (twMerge can't de-dupe a raw colour class against the variant base); critical actions must
  never require horizontal scroll (use `Toolbar`); a side panel must be reachable at every
  width (`Sheet` + `useIsMobile`, never `hidden md:block` as the only entry point).
- **`npm run verify`** — one command that runs the whole gate (typecheck, check:exports,
  check:claims, validate, a11y, check:meta, build). CI runs the same steps, so a PR that
  reintroduces drift is red.
- **"Invariants" section in `AGENTS.md`** — every self-claim the repo makes, how it stays
  true (generated or checked), and the command that verifies it. New capabilities extend
  this list rather than adding a hand-maintained fact.
- `docs/consuming.md` — the exact, **end-to-end-verified** setup for consuming the DLS in
  a fresh Vite + Tailwind v4 app: how to get the package (local `npm pack` tarball today;
  registry when published), the theme + Tailwind `@source` wiring (the #1 silent failure),
  `ThemeProvider`, peer deps, troubleshooting, and a maintainer release checklist. Linked
  from `README.md` and `AGENTS.md`. `scripts/check-exports.mjs` now also fails if this doc
  drifts from the package name / `./styles` export.

### Changed
- **Component count 57 → 58** — added `Toolbar` as a 2one-authored UI primitive. shadcn stays
  54; 2one-authored 3 → 4. `build-manifest.mjs` keeps `Toolbar` out of the `shadcn_primitives`
  count (it isn't shadcn) so the manifest stays honest; README / AGENTS / showcase / llms.txt /
  knowledge-base updated to match.
- **Graph node ids now match their `type`.** 2one-only components are `component-2one:<name>`
  (was `component:<name>`), so an impact-analysis consumer keyed on the id prefix is correct
  (this ambiguity previously broke one). `AGENTS.md` no longer hard-codes the graph node/edge
  count — it points at `graph.json → stats`, read live.
- **Killed the "light-only" truth-drift.** Corrected stale single-theme wording to
  reflect the shipped light + audited dark themes across `README.md`,
  `src/styles/globals.css`, `package.json`, `guide-app/knowledge-base.md`,
  `guide-app/VERSIONLOG.md`, and `recipes/build-a-website.md`. Renamed the graph's
  theming rule id (`rule:light-only` → `rule:theming`) so the id no longer encodes a
  stale claim; `graph.json` regenerated.
- **Trimmed the shipped dependency surface.** Moved dev-showcase-only packages
  (`@dnd-kit/*`, `@tanstack/react-table`, `date-fns`) from `dependencies` to
  `devDependencies`, and removed `@tabler/icons-react` (→ lucide). Consumers no
  longer install those.
- `sonner` reads the active theme via `next-themes`, which is bundled as a runtime
  dependency for the exported `ThemeProvider` (light + audited dark).

### Fixed
- **Consumption path was broken:** the shipped `dist/styles.css` does
  `@import 'tw-animate-css'`, but that package was a **devDependency**, so a consumer
  installing `@yokesh-2one/design-library` hit `Can't resolve 'tw-animate-css'` and the
  documented setup failed. Moved `tw-animate-css` to `dependencies`. Verified end to end:
  a blank Vite + Tailwind v4 app that follows `docs/consuming.md` now builds a themed pill
  `Button` with the audited `.dark` palette and no unstyled flash.
- Corrected the "removed `next-themes`" changelog claim — `next-themes` is a runtime
  dependency again (the exported `ThemeProvider` and `sonner` use it).

- **Told the truth about the install path.** The package is not on a public
  registry, so `README.md`, `AGENTS.md`, `.cursorrules` and `llms.txt` document the
  path that works today rather than an install command that 404s. A `prepare` hook
  means `npm install github:yokesh-2one/2one-design-library#v0.2.0` builds a real
  `dist/` on install — verified from a clean project.
- **Scope renamed** `@yokesh-2one/design-library` → `@2one/design-library` across
  the repo, before first publish, since the package name is a one-way door.
- **Engine/payload seam.** Payload paths and rule parameters moved to
  `dls.config.json`, payload prose to `dls.identity.json`, so the generators
  contain no knowledge of which design system they are describing. Proven by
  running the whole pipeline against a second, deliberately unlike payload
  (`fixtures/acme`, `npm run test:fixture`) — which found seven bugs that all
  reported success while doing the wrong thing.
- **Output auditing** (`npx 2one check`) — 12 rules covering invented tokens,
  foreign palettes and icon sets, the wordmark typeset as text, and imports the
  package does not export. Grounded in `graph.json` and the generated export list,
  so it catches a token that merely *sounds* like this system's vocabulary.
- **W3C DTCG token export** (`tokens/tokens.dtcg.json`) — semantic tokens alias
  their ramp step rather than duplicating the hex, so the relationship survives
  into design tooling as a variable reference.
- **Generated AI entry files** — `CLAUDE.md`, `GEMINI.md`, `.cursorrules` and
  `.github/copilot-instructions.md` are produced from `manifest.json`, so they
  cannot disagree with it. `check:meta` fails if they drift.

## [0.1.0] - 2026-08-12

- Initial 2one DLS: 54 shadcn/ui primitives re-skinned to the 2one tokens, 3
  2one-only components (`Logo`, `AppBar`, `BottomNavItem`), token pipeline,
  brand, templates, and the AI-legibility layer (manifest, graph, llms.txt).
