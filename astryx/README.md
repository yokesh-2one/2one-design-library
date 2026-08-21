# 2one × Astryx

The **Astryx** bucket of the 2one Design Library — Meta's open-source
[Astryx](https://github.com/facebook/astryx) design system (React 19 + StyleX)
**re-skinned to the 2one brand**. It lives here, separate from the shadcn/Tailwind
library at the repo root, because the two are different frontend stacks and can't be
merged — this is the "store separately by stack" split (shadcn · astryx).

## What's here

- **`src/2oneTheme.ts`** → **`dist/theme-2one.css`** — the 2one brand theme for Astryx
  (the actual 2one contribution): Satoshi headings + Inter body, near-black accent,
  grayscale spine, `danger #c81e1e` / `success #15803d` as the only hues. One theme
  re-skins all 108 Astryx components.
- **`src/overrides.css`** — forces 2one grayscale over Astryx's bundled default
  (atmeta-blue) theme where it out-scopes the token layer.
- **`src/gallery/`** — 81 component demos, **`src/templates/`** — 38 page templates,
  fetched from Astryx's CLI (`@astryxdesign/cli template <name>`). A picker app
  (`src/App.tsx`) renders them with a light/dark toggle.
- **`scripts/apca-audit.mjs`** — `npm run a11y`, mirroring the root DLS audit (APCA
  contrast, both light + dark).

## Licensing / attribution

Astryx is **MIT-licensed, © Meta Platforms, Inc.** The files in `src/gallery/` and
`src/templates/` are derived from Astryx's own component/template catalog and retain
their Meta copyright headers. The 2one theme, overrides, and audit are original 2one work.

## Run it

```bash
cd astryx
npm install          # installs @astryxdesign/core + peers (React 19, StyleX)
npm run theme:build  # regenerate dist/theme-2one.css from src/2oneTheme.ts
npm run dev          # showcase at http://localhost:4200 (Components / Templates)
npm run a11y         # APCA contrast audit, light + dark
```

## Known scope

- 5 of 43 page templates are excluded: `kanban-board`, `shell-top-nav` (need the
  StyleX build plugin), and 3 table variants that depend on `@astryxdesign/charts` /
  `@astryxdesign/lab` (un-installable `0.0.0-bootstrap` pre-releases).
- Astryx's `Table` logs a React `<tr>`/`<tbody>` nesting warning (Meta's component,
  cosmetic).
- Dark mode is driven by Astryx's `data-astryx-media="dark"` attribute.
