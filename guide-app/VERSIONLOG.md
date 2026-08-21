# DLS Version Log

What's available in the 2one DLS today vs. what's planned. Git history is the
authoritative record; this is the human-readable summary. Breaking changes are
flagged with **⚠ BREAKING** and migration guidance.

---

## Available now — `dls-v0.1.0` (draft)

**Tier 1 — Brand Foundation**
- ✅ Mission, vision, tagline, voice, tone, personality, archetype, personas — `brand/brand.json` + `brand/BRAND.md`

**Tier 2 — Design Foundation**
- ✅ Colour tokens (grayscale ramps + semantic) with WCAG + APCA contrast data — `tokens/colors.json`
- ✅ Typography tokens (Satoshi/Inter, full scale) — `tokens/typography.json`
- ✅ Spacing + radius tokens — `tokens/spacing.json`
- ✅ Theme (tokens → shadcn variables, light + audited dark) — `src/styles/globals.css`
- 🔲 Iconography, illustration, photography, patterns, moodboard — *not in the current
  Figma scope yet; will arrive as those are added to Figma (future content)*

> **Everything currently in Figma is already integrated into this repo.** The items
> marked 🔲 are not gaps against today's Figma — they're future design content.

**Tier 3 — Design System (applied)**
- ✅ 54 shadcn primitives, re-skinned to 2one — `src/components/ui/`
- ✅ 3 2one-only components (`Logo`, `AppBar`, `BottomNavItem`) — `src/components/`
- ✅ 9 block templates (auth + menu-less dashboard) — `src/blocks/`
- ✅ 31 chart templates (grayscale) — `src/blocks/charts/`
- ✅ Recipes (app / website / marketing / deck) — `recipes/`

**AI-legibility & tooling**
- ✅ `manifest.json` with `instructions_for_ai` (anti-hallucination contract)
- ✅ Knowledge base for local Q&A — `guide-app/knowledge-base.md`
- ✅ Accessibility audit — `npm run a11y`
- ✅ Token + manifest generators — `npm run tokens` / `npm run manifest`
- ✅ JSON schemas + validation — `schema/`, `npm run validate`
- ✅ Documentation — `README.md`, `docs/accessibility.md`

---

## Planned / roadmap

| Item | Status | Notes |
| --- | --- | --- |
| Automated Figma → repo extraction pipeline | Owner-led, future version | Current Figma content is **already integrated**; the automated sync is a later version update (PRD FR-1–4) |
| Per-component multi-format output (json/svg/html-css) | Planned | Generated from the same canonical source (PRD FR-7/8) |
| iOS / Android token exports | Planned | From `tokens/*.json` |
| MCP query server / API | Planned (stretch) | Structured queries; JSON index ships first (PRD FR-12) |
| Canva integration | **Repo accessible now** | Export + docs in `integrations/canva/`; the integration itself is **user-built**. Needs the repo reachable by Canva (public, or a PAT) |
| Tier 2 visual categories (icons/illustration/photo/moodboard) | Future content | Arrive as added to Figma |
| Dark theme | **Shipped** | Audited light + dark ship together; toggle via `ThemeProvider` (`npm run a11y` audits both) |

---

## How to read versions

- `git log` / release tags are canonical.
- Releases will use semantic versioning (`dls-vMAJOR.MINOR.PATCH`).
- A token removal or rename is **⚠ BREAKING** and will list the old → new mapping here.
