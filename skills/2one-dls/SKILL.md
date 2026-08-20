---
name: 2one-dls
description: Build UI with the 2one Design Language System — screens, marketing pages, decks, and social assets that are on-brand by construction. Use whenever the work involves 2one components, tokens, brand voice, or the logo, or when a request mentions the 2one DLS, @yokesh-2one/design-library, or building something "on-brand" for 2one. Also use when auditing existing UI code against the 2one rules.
---

# Building with the 2one Design Language System

The 2one DLS is shadcn/ui re-skinned to 2one's tokens, plus the brand and a
machine-readable contract. Output built with it should be indistinguishable from
work 2one produced by hand — not "close to the brand," but built *from* it.

**The system is grayscale.** No brand hue anywhere. Buttons are pills. Satoshi
for headings, Inter for body. `danger` and `success` are the only hues and are
reserved for validation state. If output looks like a typical SaaS page —
gradient hero, coloured CTA, accent-tinted cards — the system is being ignored,
not expressed.

## The loop

Do not generate, hand over, and hope. Run this every time:

```
1. npx 2one info --json      ← what is installed, how to import, what is broken
2. resolve the assumptions   ← §Before you generate
3. write the code
4. npx 2one check <path>     ← audit against the rules
5. fix and re-run until clean
```

Step 1 matters because this file cannot know the answer. Whether the DLS is
installed, which version, whether Tailwind is scanning the package, whether you
are inside the DLS repo or a consuming project — all of that is measured, never
assumed. **Never state a version or a component list from memory.**

Step 4 matters because rules that are only read get followed inconsistently.
`check` reports file, line, rule, and the fix. Treat a non-zero exit as
unfinished work.

If `2one info` reports problems, fix those first — the most common are Tailwind
missing, the theme not imported, or the package not `@source`d. That last one
fails silently: every class is tree-shaken and the UI renders completely
unstyled, which reads as "the library is broken" rather than "one line is
missing."

## Before you generate

Resolve these. If the person is evaluating or says "just pick," take the
default, **say which defaults you took**, and continue. Never interrogate
someone who asked for a quick look.

| Question | Default |
| --- | --- |
| What surface — product screen, marketing page, deck, social, email? | product screen |
| Target stack — React + this library, or the client's own kit? | React + `@yokesh-2one/design-library` |
| Which persona is reading? (`brand/brand.json`) | none — neutral 2one voice |
| What is the ONE primary action? | infer from the request |
| Light, dark, or both? | light |
| Real content or placeholder? | realistic placeholder in the 2one voice |

## Output format

**React + Tailwind, importing real components.** That is the point of the
system: output inherits the accessibility, the states, the pill override, and
every later fix. `2one info` tells you the exact import form for this project.

Fall back to self-contained HTML only when the consumer genuinely cannot run
React — and say plainly that it is a token-faithful *reproduction*, not the real
components.

**If the client has their own component library** (MudBlazor, Vuetify, in-house),
their kit wins for structure and this system supplies the *design decisions* —
tokens, brand voice, rules, contrast thresholds. Map by role; never import
`@yokesh-2one/design-library` into a non-React codebase.

## The rules

Full detail, each with wrong/right code:

- [rules/brand.md](rules/brand.md) — the logo, colour, voice
- [rules/composition.md](rules/composition.md) — layout, spacing, containers, one primary
- [rules/forms.md](rules/forms.md) — fields, validation, never colour alone

The three that are violated most often:

**The wordmark is an asset, never type.** `<Logo />` in React, or inline the SVG
from `brand/logo/svg/`. Typesetting "2one" in Satoshi looks nearly right and is
wrong. A generic icon standing in for the mark is the same error.

**One primary action per view.** Everything else is `secondary`, `outline`, or
`ghost`. Two primaries means neither is.

**Never signal state by colour alone.** An invalid field needs an icon or text
plus `aria-invalid` — a red border is not a message.

## Where the facts live

Never invent a value. Fetch it.

| You need | Source |
| --- | --- |
| Exact colour / type / spacing | `tokens/*.json` (includes WCAG + APCA contrast data) |
| Tokens for a design tool | `tokens/tokens.dtcg.json` (W3C DTCG) |
| Brand voice, tone, personas | `brand/brand.json` |
| Logo files and rules | `manifest.json` → `index.assets`, `brand/logo/manifest.json` |
| What exists / what doesn't | `manifest.json` → `index` |
| Impact of changing a token | `npm run what-uses -- <token>` |
| Everything, from a URL | `llms.txt` at the repo root |

Raw base for fetching without a clone:
`https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/`

## What this system does not have

Say so rather than improvising a substitute:

- **No landing-page blocks.** `src/blocks/` covers auth and one dashboard. A
  marketing page means composing primitives — say that, then do it well.
- **No Figma component library.** Tokens export to DTCG; components do not.
- **No illustration, photography, patterns, or motion presets.** An invented
  illustration or a stock photo is off-brand by definition.
- **No icon set of its own.** lucide only — never mix in a second set.
