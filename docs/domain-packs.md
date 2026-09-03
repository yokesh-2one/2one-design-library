# Domain packs — extending the graph without polluting the core

The core DLS knowledge graph is **domain-neutral**: its intents are generic UI needs
(submit a form, confirm an action, show a profile, an app shell). A real product also
has **domain** intents — *join a meeting*, *check out a cart*, *book a slot* — that must
never live in the core, or the "neutral engine" grows a Zoom (or a Shopify) opinion.

A **domain pack** is how you add them: a small set of domain **patterns** + **intents**
that *consume* the core's components and rules, kept in your own repo, layered on top of
the graph. `graph-decide` then answers your domain intents exactly as it answers the
built-in ones — and when it can't, it tells the caller to reach for a domain pack:

```
$ 2one decide "join a meeting"
  No intent matches "join a meeting". A product-domain intent … is not in the core
  graph — add it as a domain pack: see docs/domain-packs.md.
```

## What a pack contains

| Piece | Where | What it is |
|---|---|---|
| **Pattern spec** | `rules/patterns/<name>.json` | The composition: `composes.components` (real core components only), `governed_by` (core rule ids), `implementation` (`tsx` or `spec-only`), and the usual `purpose` / `when_to_use` / `accessibility` / `assumptions` / `references`. |
| **Component** (optional) | `src/patterns/<name>.tsx` | The real implementation, if `implementation: "tsx"`. Omit it for a `spec-only` pattern. |
| **Intent + edge** | `graph/decisions.json` | An `intent:` node (with `aliases`) and a `realized_by` edge from the intent to the pattern. |

Every part is **checked**: `check:patterns` grounds a spec's components/rules against real
nodes, and `check:graph-integrity` fails the build if a pattern has no graph node, a
dangling source, or an `implementation` mark that disagrees with its file.

## Add one — a worked example

Say your product needs a **meeting stage** (a responsive grid of participant tiles).

1. **Write the pattern spec** — `rules/patterns/meeting-stage.json`:

   ```json
   {
     "id": "pattern:meeting-stage",
     "label": "Meeting stage",
     "tier": 3,
     "kind": "page-pattern",
     "implementation": "spec-only",
     "purpose": "A responsive grid of participant tiles with empty/loading/error states.",
     "composes": { "components": ["card", "avatar", "aspect-ratio", "skeleton"] },
     "governed_by": ["no-color-alone", "tokens-only"],
     "assumptions": ["Tile count and media state come from your call layer — placeholder here."],
     "references": { "shadcn_block": null, "shadcn_primitives": ["card", "avatar", "aspect-ratio", "skeleton"], "two_one_blocks": [] }
   }
   ```

   Compose from **real core components** (`npm run graph` lists them) and cite **core rule
   ids**. Do not invent tokens, hues, or components — the checks reject that.

2. **Register the intent** — add to `graph/decisions.json`:

   ```jsonc
   // nodes.intent[]
   { "id": "intent:meeting-stage", "label": "Show the meeting stage",
     "aliases": ["meeting stage", "participant grid", "call layout"],
     "source": "rules/patterns/meeting-stage.json" }

   // edges[]
   { "source": "intent:meeting-stage", "target": "pattern:meeting-stage", "type": "realized_by" }
   ```

3. **Rebuild and check** — `npm run build:meta && npm run verify`. Now:

   ```
   $ 2one decide "meeting stage"      →  pattern:meeting-stage
   $ 2one decide "participant grid"   →  pattern:meeting-stage   (matched by alias)
   ```

## Keeping a pack separate from core

- **Compose down, never up.** A domain pattern may use core components and rules; the core
  must never reference a domain pattern. That one rule keeps the engine neutral and your
  pack removable.
- **Namespace by product**, not by generic word — `pattern:meeting-stage`, not
  `pattern:stage` — so two packs never collide.
- **Ship packs in their own repo/module** that depends on `@2one/design-library`. The core
  stays a neutral engine; the pack is the opinion for one product surface.
- **Accessibility and the anti-slop floor still apply** — a pack's patterns are audited by
  the same `check:usage` rules as everything else. A domain pack changes *what* you build,
  never *whether it's accessible or on-brand*.
