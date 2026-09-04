# Writing copy for the web

How 2one writes marketing and website copy. This sits **below** the brand writing
rules and **above** the UX rules:

`brand/brand.json` → `writing_rules` → this doc → `rules/ux-rules.json`.

Accessibility always wins. Where a web-writing habit (from an SEO or nonprofit guide)
conflicts with the 2one voice or with accessibility, the 2one voice and accessibility
win. The mechanical parts are checked by `npm run check:web-copy`; the judgement parts
are a copy pass, not a token.

The voice is already defined in [`brand/brand.json`](../brand/brand.json) (minimal,
factual, empathetic-then-bold). This doc adds the **web-specific** habits, with wrong
vs right examples in the same shape as [`skills/2one-dls/`](../skills/2one-dls).

---

## 1. Lead with the outcome (inverted pyramid)

The H1 and first paragraph say what the page is and the one thing to do. Supporting
detail comes after. Rule: [`landing-inverted-pyramid`](../rules/ux-rules.json).

- **Wrong** — H1: "Welcome to 2one" · first line: "We're a team passionate about design."
- **Right** — H1: "2one is a design system you can build production UIs from" · first
  line: "Install the library, wire one `@source` line, and ship accessible screens in
  light and dark. Start with the quickstart."

Why: people scan before they read. If the outcome and the action aren't in the first
screenful, they leave.

## 2. Headings stand alone

A heading should make sense out of context, in words people actually search. No clever
titles, no `Topic: subtitle` colon-titles, no naming a thing by a metaphor.

- **Wrong** — "The engine" (when you mean the knowledge graph) · "Beyond components:
  a philosophy"
- **Right** — "Knowledge graph" · "How components compose"

## 3. One idea per paragraph; lists for lists

Features, files, and steps are lists, not prose paragraphs. Keep paragraphs short.

- **Wrong** — "The library ships components and tokens and a graph and it also has a
  brand layer and docs and…"
- **Right** — a bulleted list: Components · Tokens · Knowledge graph · Brand · Docs.

Do **not** claim "people don't scroll" — they do. Write so they can scan *and* scroll.

## 4. Links name their destination

Rules: [`link-text-descriptive`](../rules/ux-rules.json),
[`link-label-consistency`](../rules/ux-rules.json).

- **Wrong** — "To read the manifest, [click here](#)." · "See
  [https://github.com/…](#)." · "[Read more](#)."
- **Right** — "Read the [live manifest.json](#)." · "Browse the
  [GitHub repository](#)."

Same destination → same label everywhere it repeats (header, footer, body). The only
exception is a genuinely different action to the same URL (e.g. "Start free" vs
"Pricing") — and where you use it, say why in a comment. Links must be distinguishable
by more than colour (underline or equivalent), with `--brand` for emphasis — never
colour alone.

## 5. Claim only what the repo backs

Rule: [`no-invented-capabilities`](../rules/ux-rules.json). Every capability, price, or
number needs a repo file, a command, or a human-provided figure behind it.

- **Wrong** — "Trusted by thousands of teams." · "Save 20% annually." · "Battle-tested
  in production."
- **Right** — "59 components, every pair APCA-audited (`npm run a11y`)." · "v0.2.0 —
  not yet proven in production (see [AGENTS.md](../AGENTS.md))."

State the honest gaps plainly (no product test suite in consumer CI, single package
entry, not on npm, no photography). Dark mode is **not** a gap. And don't collapse the
product to one part of it — the graph is the engine, not the whole product.

## 6. Voice on the web

- Active voice, second person, contractions. Write to "you".
- Factual, not peppy. Ignore "be upbeat/be peppy" university and nonprofit guides — 2one
  is factual and specific.
- Page `<title>` and meta description use the same plain language as the H1.

## 7. Anti-slop (mechanical)

`npm run check:web-copy` flags these in marketing copy:

- Link text `click here` / `read more` / bare `here`, and raw URLs as link text.
- Em-dash piles — see [`copy-em-dash`](../rules/ux-rules.json) (four or more in one
  view).
- `not just X, but Y` / `it's not… it's…` contrast padding.
- Bait words with no source: **delve, leverage, unlock, elevate, seamless, robust,
  spearhead, tapestry, landscape, journey, battle-tested** — allowed only when the word
  is a real term already used in a repo file.

## Media

No stock photos, generated art, or decorative header images — photography and
illustration are absent from this system (`manifest.json`). Use
[`MediaPlaceholder`](../src/components/media-placeholder.tsx) and `AvatarFallback`.

## Not adopted (deliberately)

These common web-copy rules are **not** 2one rules, and `check:web-copy` does not
enforce them: reading-grade / Flesch / Siteimprove gates (product copy keeps words like
`graph.json`, "Customise", "APCA"), Hemingway as a required tool, fixed "300–700 words
per page", "no periods on complete-sentence bullets", GEO / "show up in ChatGPT", and
donor/nonprofit voice.
