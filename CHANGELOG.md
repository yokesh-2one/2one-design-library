# Changelog

All notable changes to `@yokesh-2one/design-library` are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
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

### Changed
- **Told the truth about the install path.** `@yokesh-2one/design-library` isn't on a
  public registry yet, so rule #1 ("import from the package") in `README.md`, `AGENTS.md`,
  `.cursorrules`, and `llms.txt` now points at the works-today path (local tarball / vendored
  source) and marks registry install as "when published" — no more documenting an install
  command that 404s.

## [0.1.0] - 2026-08-12

- Initial 2one DLS: 54 shadcn/ui primitives re-skinned to the 2one tokens, 3
  2one-only components (`Logo`, `AppBar`, `BottomNavItem`), token pipeline,
  brand, templates, and the AI-legibility layer (manifest, graph, llms.txt).
