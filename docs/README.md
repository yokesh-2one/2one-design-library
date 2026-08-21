# Documentation

Written material lives in three places, deliberately. They hold different
*kinds* of content, and flattening them would lose the distinction between a
rule you must follow, a walkthrough for starting a job, and the current state of
the system.

## `docs/` — rules

Normative. These are constraints on any output built with the DLS, not
suggestions.

| | |
| --- | --- |
| [building-with-the-dls.md](building-with-the-dls.md) | The consistency rules, distilled from real mistakes made building this repo. Read before generating any UI. |
| [accessibility.md](accessibility.md) | Contrast policy (APCA layered on WCAG 2.x AA), thresholds, and the non-negotiables. Verified by `npm run a11y`. |

## `../recipes/` — walkthroughs

How to start a particular job. Short and task-shaped.

[build-an-app](../recipes/build-an-app.md) ·
[build-a-website](../recipes/build-a-website.md) ·
[build-marketing](../recipes/build-marketing.md) ·
[build-a-deck](../recipes/build-a-deck.md)

## `../guide-app/` — knowledge and status

| | |
| --- | --- |
| [knowledge-base.md](../guide-app/knowledge-base.md) | Offline Q&A source. What an AI reads to answer questions about the DLS without network access. |
| [VERSIONLOG.md](../guide-app/VERSIONLOG.md) | What exists today vs what is planned. Check here before assuming a capability. |
| [feedback.md](../guide-app/feedback.md) | How to raise a gap or a problem. |
| [README.md](../guide-app/README.md) | Running the guide app locally. |

## Not documentation, but where the facts actually live

Prose can go stale; these are generated from source and verified by
`npm run check:meta`, so they cannot.

| | |
| --- | --- |
| `manifest.json` | The machine-readable index + the `instructions_for_ai` contract. **Read this first.** Includes `system` (conventions, theme map, overrides) and `index.assets` (logo, fonts, icons). |
| `tokens/*.json` | Exact colour, type, and spacing values, with WCAG + APCA contrast data. |
| `tokens/tokens.dtcg.json` | The same tokens in W3C DTCG format, for Figma and other design tooling. |
| `graph.json` | The knowledge graph — every token, component, and block as a node, with the relationships between them. Query it with `npm run what-uses -- <token>`. |
| `skills/2one-dls/` | The rules as wrong/right code pairs, plus `npx 2one info` and `npx 2one check`. |
