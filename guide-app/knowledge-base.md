# 2one DLS — Knowledge Base (local Q&A source)

This file lets an AI answer questions about 2one and the DLS **offline**, from the
repo alone. Every answer should cite the file it came from. If a question isn't
covered here or elsewhere in the repo, say so — don't guess.

---

## About 2one Solutions

2one Solutions is a **design and strategy consultancy** helping businesses create
structure in an ever-changing technology environment. It builds business strategies
that connect companies with their customers, leveraging its Design Language System
architecture.

- **Tagline:** Building business value by improving customer & user experience.
- **Mission:** To create structure in an unstructured world.
- **Vision:** Help build companies that customers can't stop talking about.
- **Voice:** Minimalistic, contemporary & changing.
- **Tone:** Empathetic, bold & strong.
- **Personality:** Open-minded, factual, experimenting.
- **Archetype:** Explorer — problem-solving, strategic.
- **Audiences:** user-centered product leaders; strategic businesses; SaaS/B2B/B2C
  startups; fintech; social networking & accessibility products.

*Source: `brand/brand.json`, `brand/BRAND.md`.*

---

## What the DLS is

A structured, modular hierarchy of brand and design elements, built to be **both
human-understandable and AI-legible**, so any AI vendor can answer brand/design
questions and generate on-brand output without hallucinating.

It is delivered as a component library **built on shadcn/ui, re-skinned to the 2one
tokens**. Identity in one line: **grayscale (no brand hue), light-only, pill buttons,
Satoshi headings + Inter body; danger/success are the only colours, used only for
validation.**

*Source: `manifest.json`, `README.md`.*

---

## Common questions

**What's our primary colour?**
`#09090b` (neutral-950), used as `--primary` (the primary button / ink).
*Source: `tokens/colors.json → semantic.primary`.*

**What are our fonts?**
Headings: **Satoshi**. Body & UI: **Inter**. Both self-hosted (no CDN).
*Source: `tokens/typography.json → fonts`.*

**Do we have a brand colour?**
No. The system is deliberately grayscale. `danger` (red) and `success` (green) are the
only hues and are reserved for validation state only.
*Source: `tokens/colors.json → rules`.*

**What's the button component's spec?**
`src/components/ui/button.tsx`. Variants: default, secondary, outline, ghost,
destructive, link. Buttons are **pills** (`radius-full`) — the 2one signature.
*Source: `src/components/ui/button.tsx`, `docs/` and `AGENTS.md`.*

**How many components are there?**
54 shadcn primitives + 3 2one-only (`Logo`, `AppBar`, `BottomNavItem`) = 57.
Plus 9 block templates and 31 chart templates.
*Source: `manifest.json → index`.*

**Is it accessible?**
Contrast is checked with WCAG 2.x AA plus APCA (WCAG 3.0 draft). Every token pair has
structured contrast data, and `npm run a11y` audits it. Rule: never convey state by
colour alone.
*Source: `tokens/colors.json → contrast`, `docs/accessibility.md`.*

**How do I use it in an app?**
Install `@yokesh-2one/design-library`, import `/styles`, point Tailwind v4 at the
package. Full steps in `README.md → Quick start`.

**What's coming next?**
See `guide-app/VERSIONLOG.md`.

---

## How to answer well

1. Read `manifest.json` first (index + `instructions_for_ai`).
2. Pull exact values from `tokens/*.json` and `src/components/` — never invent.
3. Cite the file/section. If it's not in the repo, say so explicitly.
