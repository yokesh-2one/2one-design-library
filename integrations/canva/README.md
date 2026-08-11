# Canva integration

The 2one DLS is built to be **consumed by Canva**, not duplicated into it. Canva (or
a Canva app a user builds) reads the same canonical tokens as everything else.

> **Canva integration is built by users.** This folder makes the repo *accessible*
> and documents how — it does not ship a Canva app itself.

## What Canva consumes

[`brand-kit.json`](brand-kit.json) — a Canva-friendly export generated from the
canonical tokens (`npm run tokens`), so it never drifts:

- `colors[]` — named brand colours (`{ name, hex }`)
- `neutral_ramp[]` — the full grayscale ramp
- `fonts` — `{ heading: "Satoshi", body: "Inter" }`
- `rules` — the colour usage rules (grayscale only; danger/success = validation only)

## How a user connects it

**A. Manually (Canva Brand Kit / Brand Hub)**
Open `brand-kit.json` and add the listed hex colours and fonts to your Canva Brand
Kit. Fonts (Satoshi, Inter) must be uploaded to Canva separately — the files are in
[`../../src/styles/fonts/`](../../src/styles/fonts).

**B. Programmatically (Canva Apps SDK / Connect API)**
A Canva app can `fetch` the export at its raw URL and apply the colours/fonts:

```
https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/integrations/canva/brand-kit.json
```

The same pattern works for any token file, e.g.
`.../main/tokens/colors.json` (full ramps + contrast data).

## ⚠ Access requirement (owner action)

For Canva (or any external tool) to fetch these raw URLs, the repository must be
**reachable**:

- **Public repo** → the raw URLs above work with no auth. *(Recommended for testing.)*
- **Private repo** → the fetch needs a GitHub token with `repo` scope, passed as an
  `Authorization: token <PAT>` header. Raw URLs alone will 404.

Changing repository visibility is a GitHub **Settings → General → Visibility** action
(owner only) — it can't be set from the code.

## Keep it current

`brand-kit.json` is generated. After any token change:

```bash
npm run tokens      # regenerates tokens/*.json AND integrations/canva/brand-kit.json
```
