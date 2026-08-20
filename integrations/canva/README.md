# Canva integration

The 2one DLS is built to be **consumed by Canva**, not duplicated into it. Canva (or
a Canva app a user builds) reads the same canonical tokens as everything else.

> **Canva integration is built by users.** This folder makes the repo *accessible*
> and documents how — it does not ship a Canva app itself.

## What Canva consumes

[`brand-kit.json`](brand-kit.json) — a Canva-friendly export generated from the
canonical tokens (`npm run tokens`), so it never drifts:

- `colors[]` — named brand colours (`{ name, hex }`), **light theme**
- `neutral_ramp[]` — the full grayscale ramp
- `fonts` — `{ heading: "Satoshi", body: "Inter" }` plus a sourcing note
- `logo` — fetchable SVG + PNG URLs for both variants, with the usage rules
- `theme` — states which palette these values are (light; dark is in
  `tokens/colors.json` → `semantic_dark`)
- `rules` — the colour usage rules (grayscale only; danger/success = validation only)

## How a user connects it

**A. Manually (Canva Brand Kit / Brand Hub)**
Open `brand-kit.json` and add the listed hex colours, the logo, and the fonts to
your Canva Brand Kit.

Two things to know about the fonts:

- **Satoshi** ships here as `.woff2` in [`../../src/styles/fonts/`](../../src/styles/fonts).
  Canva's brand-font upload has historically not accepted `.woff2` — if it
  refuses, convert to `.otf`/`.ttf`, or re-download from
  [Fontshare](https://www.fontshare.com/fonts/satoshi). **Verify against Canva's
  current docs before promising a client this step is one click.**
- **Inter is not in this repo.** It comes from the `@fontsource-variable/inter`
  npm package or [Google Fonts](https://fonts.google.com/specimen/Inter) —
  Canva also has Inter built in.

Brand Kit uploads (custom fonts, multiple logos) require a paid Canva plan.

**B. Programmatically (Canva Apps SDK / Connect API)**
A Canva app can `fetch` the export at its raw URL and apply the colours/fonts:

```
https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/integrations/canva/brand-kit.json
```

The same pattern works for any token file, e.g.
`.../main/tokens/colors.json` (full ramps + contrast data).

A Canva app runs sandboxed, so an external domain must be allowlisted in the
app's settings before `fetch` will reach `raw.githubusercontent.com`. Check
Canva's current Apps SDK docs — this is the step most likely to have changed.

## Access

The repository is **public**, so every raw URL above is fetchable with no auth.
If it is ever made private, external fetches would need a GitHub token with
`repo` scope in an `Authorization: token <PAT>` header, and the plain raw URLs
would 404.

## Keep it current

`brand-kit.json` is generated. After any token change:

```bash
npm run tokens      # regenerates tokens/*.json AND integrations/canva/brand-kit.json
```

It is covered by `npm run check:meta`, so CI fails if the committed copy no
longer matches what the generator produces. Never edit it by hand.
