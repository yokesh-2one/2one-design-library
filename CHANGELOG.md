# Changelog

All notable changes to `@2one/design-library` are recorded here.
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

### Changed
- **Trimmed the shipped dependency surface.** Moved dev-showcase-only packages
  (`@dnd-kit/*`, `@tanstack/react-table`, `date-fns`) from `dependencies` to
  `devDependencies`, and removed `@tabler/icons-react` (→ lucide) and
  `next-themes` (light-only) entirely. Consumers no longer install these.
- `sonner` toaster is now fixed to the light theme (no `next-themes`).

## [0.1.0] - 2026-08-12

- Initial 2one DLS: 54 shadcn/ui primitives re-skinned to the 2one tokens, 3
  2one-only components (`Logo`, `AppBar`, `BottomNavItem`), token pipeline,
  brand, templates, and the AI-legibility layer (manifest, graph, llms.txt).
