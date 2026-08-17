# 2one × Astryx — re-skinning Meta's Astryx to the 2one brand

## The key insight
Astryx is **token-themed** (`defineTheme` → CSS variables). So we do **not** convert
108 components one by one. **One theme file re-brands the entire library at once.**
`src/2oneTheme.ts` → `dist/theme-2one.css` already re-skins all Astryx components to
2one (Satoshi/Inter, near-black accent, danger `#c81e1e` / success `#15803d`), keeping
Astryx's grayscale spine (which already matches 2one's philosophy).

## What Astryx is
- Meta's open-source design system — `facebook/astryx`, **MIT** (keep the notice).
- React 19 + **StyleX**; ships **prebuilt CSS** (`@astryxdesign/core/astryx.css`) so no
  StyleX build plugin is required. 108 components. Machine-readable catalog at
  `@astryxdesign/core/docs.mjs`.
- **Not** shadcn/Tailwind — a different stack. Cannot be merged into the shadcn 2one
  library; it lives as its own package.

## Store separately by stack (as requested)
- **shadcn bucket** → the existing `D:\Claude\2one-design-library` (shadcn/ui + Tailwind,
  already 2one-branded).
- **astryx bucket** → `D:\Claude\2one-astryx` (this project) — Astryx re-skinned to 2one
  via the theme above.

## Status
- [x] Verify Astryx is real/MIT/reachable (npm `@astryxdesign/core@0.4.3`, `facebook/astryx`)
- [x] `src/2oneTheme.ts` — 2one brand theme source
- [x] Build → `dist/theme-2one.css` (verified: Satoshi/Inter, #09090b, #c81e1e, #15803d)
- [ ] Showcase: React 19 app importing `astryx.css` + `theme-2one.css` + fonts, root
      `data-astryx-theme="2one"`, rendering components in both light/dark
- [ ] Load fonts (Satoshi woff2 from the 2one repo; Inter Variable)
- [ ] Component catalog from `docs.mjs` (all 108) in the showcase
- [ ] Optional: desaturate Astryx's decorative hues (blue/pink/…) for strict 2one grayscale
- [ ] a11y audit of the 2one Astryx theme (both light + dark), mirroring the DLS `npm run a11y`

## Build the theme
```
npx astryx theme build src/2oneTheme.ts --out dist/theme-2one.css
```
