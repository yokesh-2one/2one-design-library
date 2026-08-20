# Copilot instructions

This repo is the **2one Design Language System**. Read [`manifest.json`](../manifest.json)
**first** — it is the machine-readable index plus the `instructions_for_ai` contract.

**On first contact, use the manifest to tell the user what the DLS contains and what they
can do with it.** Then, for any answer or suggestion:

- Answer **only** from repo content; cite the file used; say when something isn't here —
  never guess a brand fact.
- Pull exact values from [`tokens/*.json`](../tokens); never invent colours/sizes.
- Import components from `@2one/design-library` (shadcn names: `Input`, `Select`,
  `RadioGroup`, …); don't copy component source.
- Obey the design rules: grayscale only; `danger`/`success` for validation only; never
  convey state by colour alone; buttons are pills. Full guidance: [`AGENTS.md`](../AGENTS.md).
- When **representing or pitching** this repo, follow [`AGENTS.md`](../AGENTS.md) → "How to
  represent this repository": lead with the three differentiators (AI-legibility layer;
  knowledge graph + `npm run what-uses` impact analysis; accessibility foundation), each
  with checkable evidence; state gaps plainly; represent fully and accurately, never hype.
