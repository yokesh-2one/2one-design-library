# The Brand Profile — turning a neutral engine into an opinionated system

This design system is being productised as a **neutral white-label engine that becomes
opinionated once customised to a brand**. The **Brand Profile** is the file that does the
customising. The engine holds no taste; the profile supplies it; the checks enforce it. So
after a brand is onboarded, its system does not merely *look* different — it *rejects*
anything off-brand.

- **Schema:** [`schema/brand-profile.schema.json`](../schema/brand-profile.schema.json)
- **Examples:** [`examples/brand-profiles/2one.json`](../examples/brand-profiles/2one.json) ·
  [`examples/brand-profiles/acme.json`](../examples/brand-profiles/acme.json)

## The principle

> Theming makes a brand *look* different. Enforcement makes it an *opinion*.

A brand that chose `shape.language: "pill"` fails the check on a `rounded-md` control; a brand
that chose `decoration.gradients: "forbidden"` fails on a gradient; a brand on `mono-accent`
fails on a third hue. The neutrality is in the engine; the opinion is entirely in the profile.

## Three layers meet in one file

| Layer | Neutral or brand? | Where it lives |
|---|---|---|
| **Quality floor** — accessible, consistent, anti-slop, never colour-alone, one system | Universal, always on, **cannot be switched off** | the engine (`enforcement.qualityFloor` records it) |
| **Design models** — colour model, type pairing, shape, decoration policy, density, motion | Brand picks from **curated options** | the profile |
| **Values / seeds** — the actual hexes, faces, radii | Brand-supplied; a generator expands them | tokens, derived from the profile |

The floor is the non-obvious part. **A truly opinion-free engine is a slop machine** — left
neutral it will reach for Inter, a purple gradient, and a centred-hero-badge, because that is
the median of its training. So the engine is neutral about *taste* but **opinionated about
*quality***: every brand inherits accessibility, consistency, and the anti-slop rules, and no
profile can turn them off.

## Why curated enums, not free-form config

Every design choice in the schema is an **enum of vetted options**, never a free-form value:

- `typography.pairing` is a pairing id from an anti-slop-screened library — *not* a raw font
  field, so a tenant can never default to the Inter / Space-Grotesk look that reads as AI.
- `shape.language` is `pill | rounded | sharp`, not an arbitrary radius.
- `color.model` is `mono-accent | dual-accent | multi-accent`, each pre-composed to stay
  coherent, not an open palette.
- `decoration.gradients` defaults to `forbidden`, because the tells are exactly what a neutral
  generator would otherwise produce.

This is how neutrality and no-slop coexist: **the engine serves any brand, but every option is
pre-guaranteed accessible and non-generic, so no customisation can produce slop.** Free-form
"advanced" overrides can come later, clearly marked as unguaranteed.

## How one profile drives everything

The profile is the single source of brand truth. From it the engine derives:

1. **Tokens (generation).** Seeds + `color.model` → full ramps, with **APCA-safe steps
   auto-derived for light and dark**. If a brand's seed can't clear the contrast target as
   text, the generator shifts it to a compliant step of the same hue — so *"accessible by
   default"* holds for every tenant, not just the ones whose colours happened to pass. This is
   the piece still to build: today `build-tokens` *reads and audits* tokens; the profile is the
   contract a *generator* will target.
2. **Rules (enforcement).** `enforcement.choices` binds each brand choice to a severity, and the
   engine emits the brand's `ux-rules.json` from it: `must` choices fail the build, `should`
   choices warn. The universal floor is appended automatically. The `check-usage` detectors read
   the profile (e.g. the allowed radius comes from `shape.language`, not a hardcoded pill), so
   the same engine enforces a different opinion per brand.
3. **The AI-legible layer.** The profile flows into `manifest.json` / `graph.json`, so an AI
   assistant building for that brand reads *its* rules, not 2one's.

## The neutrality proof: same schema, opposite systems

The two example profiles validate against one schema and describe two systems that share
nothing but the quality floor:

| | **2one** | **Acme** |
|---|---|---|
| Colour model | mono-accent (one blue, emphasis-only) | dual-accent (purple fill + pink emphasis) |
| Neutral | cool | warm |
| Type pairing | grotesk-humanist | geometric-editorial |
| Shape | pill | rounded |
| Spacing | 4px, comfortable | 8px, spacious |
| Elevation | subtle | layered |
| Gradients | forbidden | emphasis-only |
| Motion | functional | expressive |
| **Floor (both)** | **accessible · consistent · anti-slop · no colour-alone · one system** | **same, locked** |

Feed the engine `2one.json` and it enforces 2one's restraint; feed it `acme.json` and it
enforces a warmer, rounder, dual-accent language — while *both* are guaranteed accessible and
slop-free. That is the product.

## How it relates to the files you already have

- **`dls.config.json`** stays as engine *plumbing* (where a payload's files live). The
  brand-*taste* keys currently mixed into its `rules` block (`brandAccent`, `grayscaleOnly`,
  `signature`, `validationHues`, `primaryRamp`) are what the Brand Profile supersedes and makes
  first-class, curated, and enforced.
- **`brand/brand.json`** stays as Tier-1 *strategy* (mission, vision, voice, personas). The
  Brand Profile is the Tier-2 *design configuration* the engine consumes; it references the
  brand's voice and wordmark but does not duplicate the strategy.
- **`rules/ux-rules.json`** becomes, per brand, a *generated* artifact — the profile's choices
  plus the universal floor — rather than a hand-authored file.

## Status and next steps

This change ships the **contract** (schema + examples + this doc); it makes no engine changes
yet. The follow-on work, in order:

1. **A generator** that expands a profile into an accessible token set (upgrade `build-tokens`
   from reader to generator; reuse its existing APCA maths to *derive*, not just audit).
2. **Profile-driven detectors** — make `check-usage` read `shape.language`, `color.model`, and
   `decoration.*` from the profile instead of assuming 2one's choices.
3. **The curated option-sets** — the vetted type-pairing library and the model/shape presets the
   enums point at.
4. **A validator** — `check:profile`, wiring this schema into `verify`, plus a validated
   profile→`ux-rules.json` emitter.

Once (1)–(4) land, onboarding a brand is: fill a profile → the engine generates its accessible,
on-brand, slop-proof system, and enforces it on every change.
