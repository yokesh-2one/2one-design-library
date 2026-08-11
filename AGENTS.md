# 2one Design Language System — agent guide

This repository is the **single source of truth** for the 2one DLS: the
[shadcn/ui](https://ui.shadcn.com) component set re-skinned to the 2one design
tokens, plus the brand. Written for humans and AI agents (Claude Code, Codex,
Gemini, Copilot).

**If you are an AI agent, start here, then read [`registry.json`](registry.json).**

## How this repo is organized

- `registry.json` — machine index: the component set, the token→variable theme
  map, naming conventions, and 2one overrides. Read this first.
- `src/components/ui/` — 54 shadcn primitives, themed to 2one. **shadcn names**
  (`Input`, `Select`, `RadioGroup`, `InputOTP`, `DropdownMenu`, …).
- `src/components/` — 2one-only components shadcn lacks: `logo`, `app-bar`,
  `bottom-nav-item`.
- `src/styles/globals.css` — the theme: 2one tokens mapped onto shadcn's CSS
  variables (light-only) + `@font-face` (Satoshi). Single source of truth for color.
- `src/lib/utils.ts` — the `cn()` helper.
- `tokens/` — raw `@theme` token files (color/type/spacing).
- `brand/BRAND.md` — brand context: voice, tone, personality, mission, personas.
  Match this when writing any 2one-facing copy. `brand/logo/` holds the mark.
- `components.json` — shadcn CLI config. Add components with `npx shadcn@latest add <name>`.
- `dev/` — local sampler to verify the theme (`npm run dev`).

## Rules for using / generating code

1. **Import from the package**, don't copy source:
   `import { Button } from '@yokesh-2one/design-library'`.
2. **Use shadcn names.** TextField → `Input`, Dropdown → `Select`,
   RadioButton → `RadioGroup`, OtpField → `InputOTP`.
3. **Theme through the variables**, never hard-code color. Everything derives from
   `globals.css` (grayscale; `danger`/`success` only for validation).
4. **Buttons are pills** (`rounded-full`) — the 2one signature override.
5. **Light-only.** Don't add a `.dark` palette; `dark:` utilities stay inert.
6. **Icons:** lucide (`lucide-react`).
7. **Accessibility is a build rule, not an afterthought** — see
   [`docs/accessibility.md`](docs/accessibility.md). In short: never convey state
   by colour alone (an invalid field needs an icon/text, not just a red border);
   any new or changed colour token must pass `npm run a11y` (APCA Lc thresholds)
   layered on top of WCAG 2.x AA; don't hug the math — leave margin.

## Accessibility check

`npm run a11y` runs an APCA contrast audit that parses the live token pairs from
`globals.css` and fails (exit 1) if any drops below its Lc threshold. Run it after
any theme/token change. Full rules and thresholds: [`docs/accessibility.md`](docs/accessibility.md).

## Status

54 shadcn primitives + `Logo`/`AppBar`/`BottomNavItem`. Library build verified
(ES/CJS + types + styles + fonts) and rendering verified in `dev/`. This replaced
the earlier hand-built Figma-1:1 set (2026-08-10, user-directed).

## Source of truth chain

shadcn/ui (components, MIT) + 2one tokens/brand (Figma *Mobile App Design System*,
`YzxnyL6a69WCOw9U8WJqBo`) → this repo → `@yokesh-2one/design-library`.
