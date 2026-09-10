<div align="center">

# 2one Design Language System

**The kit every 2one product, page, and deck is built from — components, colour,
type, and brand — structured so that people *and* AI produce work that looks
like 2one.**

[See it running](https://origin.2one.solutions) · [Rules](docs/) · [For AI tools](llms.txt)

</div>

---

## What it is

A design language system is a shared kit of ready-made pieces — buttons, form
fields, dialogs, tables — plus the decisions behind them: the exact greys, the
type sizes, the spacing. Everyone pulls from one kit, so everything ships
looking like it came from the same place, faster.

You can describe 2one's look in a sentence: **monochrome — no brand colour
anywhere — with fully-rounded "pill" buttons, Satoshi headings, Inter body text,
and red or green used *only* to flag errors and success.**

The bet behind it: **the best results with AI come from giving it the
foundations first.** This repo is those foundations. It gives an AI assistant —
or a new teammate — what's needed to produce on-brand work, and eliminates "AI
slop," the generic output you get when the tool has no ground truth.

| | |
| --- | --- |
| **59 components** | 54 [shadcn/ui](https://ui.shadcn.com) primitives re-skinned to 2one, plus `Toolbar`, `Logo`, `AppBar`, `BottomNavItem`, `MediaPlaceholder` |
| **9 templates** | five sign-in screens, three sign-ups, a dashboard — plus marketing sections and 31 charts |
| **Two themes** | light and dark, both grayscale-founded with one brand accent (`--brand`), both contrast-audited |
| **44 UX rules** | machine-readable, with severity and a conflict-precedence ladder |
| **Brand** | logo with usage rules, plus voice, tone, and personas |

---

## See it — 30 seconds

**[origin.2one.solutions](https://origin.2one.solutions)**

Every component, the colour and type foundations, the templates, and an
interactive map of how it all connects. Nothing to install.

## Try it with AI — 2 minutes

Paste this into Claude, or any AI tool that can fetch a URL:

```
Use the 2one Design Language System as the single source of truth for this design.

Start by fetching:
https://raw.githubusercontent.com/yokesh-2one/2one-design-library/main/llms.txt

Follow the instructions_for_ai contract in manifest.json: pull exact values from
tokens/*.json, match the brand voice in brand/brand.json, obey the rules in
docs/building-with-the-dls.md, and never invent a colour or a brand fact — if
something isn't in the repo, say so.

Then build me: [a pricing page / a sign-up screen / a launch announcement].
```

No install, no token, no clone. The repo is written to be read by machines as
well as people — see [`llms.txt`](llms.txt).

## Use it in your app

**Install straight from the repo.** No token, no registry account. Starting
from nothing:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install -D tailwindcss @tailwindcss/vite
npm install github:yokesh-2one/2one-design-library
```

Adding to an app you already have:

```bash
npm install github:yokesh-2one/2one-design-library react react-dom
```

The package builds itself on install, so you get a real `dist/`. This tracks
`main` — re-run `npm install` to pick up changes. To freeze a version instead,
append a tag — e.g. `#v0.2.0`. Full setup, including the parts that fail silently:
[`docs/consuming.md`](docs/consuming.md).

Tailwind v4 is a peer dependency, so npm installs it for you. What npm *cannot*
do is edit your stylesheet — these three lines are yours to add:

```css
/* app.css — one-time setup, per project */
@import 'tailwindcss';
@import '@2one/design-library/styles';                    /* tokens, variables, fonts */
@source '../node_modules/@2one/design-library/dist';      /* so Tailwind sees the classes */
```

**You do this once.** It is project setup, not an install step — reinstalling,
updating, or adding packages never undoes it. If `npx 2one info` reports these
after a fresh `npm install`, it means the lines are not in your CSS yet, not
that they need repeating.

> The `@source` line matters. Without it Tailwind strips every class the
> components use and the UI renders completely unstyled. The path is relative
> to **the CSS file**, so `../node_modules/…` is right for `src/app.css` and
> `./node_modules/…` for a stylesheet at the project root.

```tsx
import { Button, Input, Label } from '@2one/design-library'

export function SignIn() {
  return (
    <form className="grid max-w-sm gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Button type="submit">Continue</Button>   {/* one primary per view */}
    </form>
  )
}
```

**Requires** React 18+ and Tailwind v4. Icons come from
[`lucide-react`](https://lucide.dev).

Two commands work in any project:

```bash
npx 2one info      # what's installed here, and what's misconfigured
npx 2one check .   # audit your code against the 2one rules
```

## Work on it

```bash
git clone https://github.com/yokesh-2one/2one-design-library.git
cd 2one-design-library && npm install
npm run dev          # showcase at http://localhost:4180
```

| Command | |
| --- | --- |
| `npm run dev` | live showcase of every component |
| `npm run build` | library build → `dist/` |
| `npm run a11y` | contrast audit, both themes — fails below threshold |
| `npm run check:usage` | audit code against the design rules |
| `npm run check:meta` | fails if generated files drift from source |
| `npm run what-uses -- primary` | what breaks if this token changes |

Add a shadcn component with `npx shadcn@latest add <name>` — it lands in
`src/components/ui/` already themed. See
[Troubleshooting](#troubleshooting) for two quirks the CLI introduces.

---

## Reference

<details>
<summary><b>Project structure</b></summary>

```
src/
  components/ui/     54 shadcn primitives (2one-themed) + toolbar
  components/        logo · app-bar · bottom-nav-item  (2one-only)
  blocks/            templates — login-*, signup-*, dashboard-plain, marketing/, charts/
  styles/globals.css THE THEME — tokens → CSS variables, light + dark, @font-face
  index.ts           public entry
tokens/              colour, type, spacing — CSS for Tailwind, JSON canonical, DTCG for design tools
rules/ux-rules.json  the UX-decision contract — severity + conflict precedence
brand/               brand.json (voice, personas) · logo/ (SVG, PNG, rules)
skills/2one-dls/     the rules as wrong/right pairs + the CLI
docs/                rules · recipes/ walkthroughs · guide-app/ knowledge + status
manifest.json        READ FIRST — machine index + instructions_for_ai + system conventions
graph.json           knowledge graph — tokens, components, blocks, rules and their relationships
astryx/              the 2one brand on Meta's Astryx (React 19 + StyleX) — a second stack
dev/                 the showcase app
```
</details>

<details>
<summary><b>The four 2one-authored components</b></summary>

Pieces shadcn has no equivalent for, built to the same token system:

| Component | What it is | Key props |
| --- | --- | --- |
| **`Toolbar`** | Wrapping action bar — lays actions out and wraps them at narrow widths. | `children` |
| **`Logo`** | The 2one wordmark. Brand identification only — never decorative. | `variant: 'black' \| 'white'`, `width?` |
| **`AppBar`** | Mobile top navigation bar, 64px tall, centred title. | `title`, `onBack?`, `trailingSlot?` |
| **`BottomNavItem`** | One tab in a mobile bottom nav (icon + label). Compose several in a row. | `icon`, `label`, `selected?`, `onClick?` |

```tsx
import { Logo, AppBar, BottomNavItem } from '@2one/design-library'

<Logo variant="black" width={120} />   {/* black on light, white on dark — never recoloured */}
<AppBar title="Sign in" onBack={() => history.back()} />
```

The wordmark is an **asset, never type** — import `Logo`, or inline
`brand/logo/svg/*.svg`. `npx 2one check` fails the build if it is typeset.
</details>

<details>
<summary><b>Asking the system what to build</b></summary>

The knowledge graph is not only an index — it answers design questions
deterministically, so an agent does not have to invent a decision:

```bash
npm run graph:decide -- decide "sign-in screen"   # preferred pattern, composition,
                                                  # mandatory rules, anti-patterns, a11y
npm run what-uses -- primary                      # impact analysis: what a token change hits
```

Rules live in `rules/ux-rules.json` with a severity level
(`forbidden` → `must` → `should` → `may` → `avoid`) and a precedence ladder —
accessibility outranks brand, brand outranks consistency, and so on down.
Same graph in, same answer out; `npm run graph:test` locks that behaviour.
</details>

<details>
<summary><b>Theming &amp; tokens</b></summary>

The look is driven by CSS variables in `src/styles/globals.css`, fed by the raw
tokens in `tokens/`. The authoritative map is `manifest.json` →
`system.theme.tokenMap` — generated, so it cannot go stale.

Light and dark both ship, both grayscale-founded with the one brand accent
(`--brand`), both APCA-audited. Switch with the exported `ThemeProvider`. **Any
token change must pass `npm run a11y` in both themes.**

`tokens/tokens.dtcg.json` is the same set in W3C DTCG format — import it into
Figma via Tokens Studio, or feed Style Dictionary for other platforms.
</details>

<details>
<summary><b>Fonts</b></summary>

Satoshi for headings, Inter for body — both self-hosted, no CDN. Satoshi ships
as `.woff2` in `src/styles/fonts/`; Inter comes from `@fontsource-variable/inter`.
Both are bundled into the published styles, so consumers get them automatically.
</details>

<details>
<summary><b>Design rules</b></summary>

- **Grayscale-founded, one accent.** Structure and primary actions stay grayscale; a single brand accent (`--brand`, identity `#30A1FF`) carries emphasis (links/focus/selection). `danger`/`success` appear only on validation state.
- **Pill buttons.** The signature, enforced in `globals.css` so it survives CLI regeneration.
- **One primary per view.** Pair a `secondary` or `outline` with it.
- **The logo is an asset, never type.** Never recolour, rotate, or distort it.
- **Never signal state by colour alone.** Pair with an icon or text plus `aria-invalid`.

Full set with wrong/right code: [`skills/2one-dls/`](skills/2one-dls) and
[`docs/building-with-the-dls.md`](docs/building-with-the-dls.md).
</details>

<details>
<summary><b id="troubleshooting">Troubleshooting</b></summary>

**Everything renders unstyled.** Tailwind isn't scanning the package — add the
`@source` line above. `npx 2one info` will tell you.

**`shadcn add` reverts the pill button.** It regenerates `button.tsx` with
`rounded-md`. The pill is re-applied by an unlayered `[data-slot="button"]` rule
that wins in the cascade. Nothing to do.

**`shadcn add` injects a blue `.dark` block.** The CLI appends its own sidebar
dark palette with a blue accent. It is not the 2one dark theme — delete it and
re-run `npm run a11y`.

**Consumer TypeScript errors about missing props.** The published `.d.ts` needs
relative imports, which `tsc-alias` handles in the build. Don't drop that step.

**Importing the barrel pulls heavy deps.** `Chart` drags in `recharts`. Subpath
exports are planned.
</details>

<details>
<summary><b>FAQ</b></summary>

**Is this just shadcn/ui?** It's built on it, then re-skinned to the 2one tokens
and extended with 2one-only components, templates, brand, and the AI layer.
shadcn is the foundation; 2one is the identity.

**Can I use it without Tailwind?** No — the components ship as Tailwind classes
and need v4.

**Does it support dark mode?** Yes. Light and dark, both audited.

**Where's the visual reference?** [origin.2one.solutions](https://origin.2one.solutions),
or `npm run dev` locally.

**Are there landing-page templates?** Not yet — `src/blocks/` covers auth and one
dashboard. A marketing page means composing primitives.
</details>

---

## Credits & licensing

Components from [shadcn/ui](https://ui.shadcn.com) (MIT) on
[Radix](https://www.radix-ui.com) · icons from [lucide](https://lucide.dev) ·
[Satoshi](https://www.fontshare.com/fonts/satoshi) + [Inter](https://rsms.me/inter/).
Tokens, brand, and the 2one-only components © 2one Solutions.

> **Licensing.** This repository ships an MIT [`LICENSE`](LICENSE). **Final terms
> for the 2one tokens, brand assets, and original components are still being
> decided** — the 2one logo and name are trademarks of 2one Solutions regardless
> of the code licence. If you are evaluating, treat the brand assets as 2one's
> property and check with 2one before redistributing or rebranding.

<div align="center">

*Building business value by improving customer & user experience.*
**2one Solutions** — creating structure in an unstructured world.

</div>
