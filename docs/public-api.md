# Public API

What `@2one/design-library` exports, and how to import it. The barrel
([`src/index.ts`](../src/index.ts)) is the source of truth; `npm run check:exports`
fails if it drifts from the components that exist, so this list can't silently go stale.

## What's public

| Group | What | Import |
|---|---|---|
| **UI primitives** | The shadcn/ui set, re-skinned to 2one (Button, Card, Dialog, Table, Tabs, Form fields, …) | `@2one/design-library` or `@2one/design-library/components/ui/<name>` |
| **2one components** | `Logo`, `AppBar`, `BottomNavItem`, `MediaPlaceholder`, `ThemeToggle` | `@2one/design-library` or `@2one/design-library/components/<name>` |
| **Page patterns** (Tier 3) | `AppShell`, `PricingPage`, `MarketingSite` (+ `SiteHeader`) | `@2one/design-library` or `@2one/design-library/patterns/<name>` |
| **Marketing blocks** | `MarketingHero`, `MarketingFeatureGrid`, `MarketingStats`, `MarketingPricing`, `MarketingFaq`, `MarketingClientFaq`, `MarketingCtaBanner`, `MarketingLogoCloud`, `MarketingTestimonial`, `MarketingFooter`, `MarketingPage` | `@2one/design-library` or `@2one/design-library/blocks/marketing/<name>` |
| **Theme** | `ThemeProvider`, `useIsMobile` | `@2one/design-library` |
| **Styles** | tokens + theme CSS | `@2one/design-library/styles` |

Every export above is reachable from the barrel **and** by subpath. The build uses
`preserveModules`, so each module ships as its own file in `dist` and the package's
`"./*"` export maps a subpath straight to it.

## Barrel vs subpath

- **Barrel** (`from '@2one/design-library'`) — simplest; named exports tree-shake, so
  importing one symbol doesn't pull the rest.
- **Subpath** (`from '@2one/design-library/blocks/marketing/hero'`) — deterministic about
  what a module can reach, regardless of the bundler. Prefer it for large or rarely-used
  modules (e.g. `Chart`, which is the only thing that reaches `recharts`).

## Not public API

These exist in the repo but are **not** a supported import surface:

- **`dev/`** — the internal showcase/sampler. It is not a consumer template; follow
  [consuming.md](./consuming.md), not `dev/`.
- **`tests/`** — the visual/a11y harness.
- **Spec-only patterns** — patterns under `rules/patterns/*.json` with
  `"implementation": "spec-only"` (e.g. feed-item, profile-header) are machine-readable
  guidance, not shipped components. The graph marks which patterns ship as `tsx` vs
  spec-only.

## Honest gaps

Per [AGENTS.md](../AGENTS.md): v0.2.0, not yet proven in production; a single package
(not published to npm — install from the repo or a tarball, see
[consuming.md](./consuming.md)); no photography or illustration (use `MediaPlaceholder`).
Dark mode is **not** a gap.
