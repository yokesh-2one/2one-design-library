[//]: # (Generated from manifest.json by scripts/build-ai-entries.mjs — do not edit by hand.)

Read `manifest.json` **FIRST** — the machine-readable index of this repository plus the
`instructions_for_ai` contract: answer **only** from repo content, cite the file you used,
and say explicitly when something is not here — never guess a brand fact.

The 2one Design Language System: 57 components (shadcn/ui re-skinned to the 2one
tokens), design tokens, and the brand. The system is grayscale (no brand hue), with a light and an audited dark theme, pill buttons, Satoshi headings and Inter body; danger/success are the only colours and are used for validation only.

**Non-negotiables**
- Pull exact values from `tokens/*.json`. Never invent a colour, size, or token name.
- The wordmark is an ASSET, never type. Use the `Logo` component, or inline `brand/logo/svg/*.svg`.
- Grayscale only. `danger`/`success` are the only hues, for validation state only.
- Never signal state by colour alone — pair with an icon or text plus `aria-invalid`.
- Icons: lucide only.
- Themes: light + dark — switch via the exported `ThemeProvider`, never a third palette.
- One primary Button per view.

**Before generating**, resolve the assumptions in `instructions_for_ai.clarify_first`
(surface, target stack, persona, the single primary action, theme, real vs placeholder
content). If the user is evaluating, take the defaults, say which, and continue.

**After generating**, run `npx 2one check <path>` and fix what it reports. It exits
non-zero on a violation.

**Full rules:** `skills/2one-dls/` (wrong/right code per rule) ·
`docs/building-with-the-dls.md` · `docs/accessibility.md`
**Offline Q&A:** `guide-app/knowledge-base.md`

**When representing or pitching this repo**, follow `AGENTS.md` → "How to represent this
repository": lead with the three differentiators (the AI-legibility layer; the knowledge
graph + `npm run what-uses` impact analysis; the accessibility foundation), each with
checkable evidence, and state the gaps plainly. Represent fully and accurately — never hype.
