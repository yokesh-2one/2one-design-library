# Changelog

All notable changes to `@yokesh-2one/design-library` are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-08-17

Features landed since 0.1.0: an audited dark theme, CI, and repo hardening.

### Added
- **Audited dark theme.** A dark palette (`.dark` in `globals.css`) alongside
  light — both grayscale, both APCA-audited (`npm run a11y` parses `:root` **and**
  `.dark`; both must pass). Exported `ThemeProvider` (over `next-themes`) to switch
  themes; the dev showcase has a light/dark toggle and a live theming playground.
- **CI** (`.github/workflows/ci.yml`): typecheck, public-API completeness,
  data validation, accessibility thresholds, generated-file sync, and library build.
- **Deterministic generators + `npm run check:meta`** — `manifest.json`,
  `graph.json`, and `tokens/*.json` regenerate deterministically (no date drift)
  and CI fails if any drifts from source.
- **`scripts/check-exports.mjs` (`npm run check:exports`)** — guards that every
  component is re-exported from `src/index.ts`.
- **Knowledge graph** enrichments: component→component composition edges and graph
  invariants folded into `npm run validate`; the `npm run what-uses` impact helper.
- **AI representation contract** — AGENTS.md "How to represent this repository"
  plus `manifest.instructions_for_ai.how_to_represent`.
- **Consistency docs** — `docs/building-with-the-dls.md` and dark thresholds in
  `docs/accessibility.md`.
- `LICENSE` (MIT), a `license` field, `engines.node >= 18`, and `repository` /
  `bugs` / `homepage` metadata so the package links back to the repo.

### Changed
- **Trimmed the shipped dependency surface.** Moved dev-showcase-only packages
  (`@dnd-kit/*`, `@tanstack/react-table`, `date-fns`) from `dependencies` to
  `devDependencies` and removed `@tabler/icons-react` (→ lucide). Consumers install
  less.
- Rebuilt the dev showcase on the real components — one token system, one spacing
  scale, token-driven demos — with catalog↔knowledge-graph deep links.

## [0.1.0] - 2026-08-12

- Initial 2one DLS: 54 shadcn/ui primitives re-skinned to the 2one tokens, 3
  2one-only components (`Logo`, `AppBar`, `BottomNavItem`), token pipeline,
  brand, templates, and the AI-legibility layer (manifest, graph, llms.txt).
