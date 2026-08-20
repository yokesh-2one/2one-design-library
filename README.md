<div align="center">

# 2one Design Language System

**One place for every piece 2one builds with — buttons, forms, layouts, colour, type, and brand — so people and AI can build products that look and feel like 2one, fast.**

Grayscale · light + audited dark · pill buttons · Satoshi headings + Inter body
54 [shadcn/ui](https://ui.shadcn.com) components re-skinned to the 2one tokens · 3 mobile/brand components of our own

</div>

---

## Table of contents

- [What this is (in plain language)](#what-this-is-in-plain-language)
- [Why it exists](#why-it-exists)
- [What's inside](#whats-inside)
- [Quick start (developers)](#quick-start-developers)
- [Using components](#using-components)
- [Theming & design tokens](#theming--design-tokens)
- [Typography & fonts](#typography--fonts)
- [The 2one-only components](#the-2one-only-components)
- [Templates (blocks)](#templates-blocks)
- [Adding or updating a component](#adding-or-updating-a-component)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Building & publishing](#building--publishing)
- [For AI agents](#for-ai-agents)
- [Design rules](#design-rules)
- [Troubleshooting & gotchas](#troubleshooting--gotchas)
- [FAQ](#faq)
- [Credits & licensing](#credits--licensing)

---

## What this is (in plain language)

> **New here and not a developer? Read this section and [Why it exists](#why-it-exists). The rest is for the people wiring it into code.**

A **design language system (DLS)** is a shared kit of ready-made building blocks for a product's look and feel. Instead of every designer and developer re-inventing a button, a form field, or a colour, they all pull from one kit. The result: everything 2one ships looks like it came from the same place, and it gets built faster.

This repository **is** that kit for 2one. It contains:

- **Components** — the actual, working pieces of a screen: buttons, text boxes, dropdowns, dialogs, tables, tabs, and ~50 more.
- **Tokens** — the raw design decisions: the exact greys, the type sizes, the corner roundness, the spacing. Change a token in one place and every component updates.
- **Brand** — the 2one logo (with rules for using it) and the [brand voice](brand/BRAND.md): who 2one is, how it sounds.
- **Templates** — pre-assembled screens (login pages, a sign-up form, a dashboard) you can drop in and adjust.

You don't need to understand the code to know what 2one looks like: **it's monochrome (shades of grey, no brand colour), corners are subtle except buttons which are fully rounded "pills," headings are set in *Satoshi* and body text in *Inter*, and the only colours you'll ever see are red and green — used *only* to flag errors and success.**

---

## Why it exists

2one Solutions helps businesses *create structure in an ever-changing technology environment.* This DLS is that principle applied to product-building itself.

The bet: **the best results with AI come from giving it the foundational blocks first, then letting human expertise drive.** This repo is those foundational blocks. It gives an AI assistant (or a new teammate) everything needed to produce on-brand product, marketing, and slides — and to **eliminate "AI slop,"** the generic, off-brand output you get when the tool has no ground truth to build from.

So this is a single source of truth, written to be read by **both humans and AI tools** (Claude Code, Codex, Gemini, Copilot). See [For AI agents](#for-ai-agents).

---

## What's inside

| Category | Count | Examples |
| --- | --- | --- |
| **shadcn/ui components** (re-skinned to 2one) | 54 | Button, Input, Select, Checkbox, Radio Group, Switch, Dialog, Sheet, Popover, Dropdown Menu, Tooltip, Tabs, Table, Card, Accordion, Badge, Avatar, Calendar, Chart, Command, Sidebar… |
| **2one-only components** | 3 | `Logo`, `AppBar`, `BottomNavItem` (mobile/brand pieces shadcn has no equivalent for) |
| **Templates (blocks)** | 9 | `login-01`…`login-05`, `signup-01`…`signup-03`, `dashboard-plain` |
| **Design tokens** | 3 files | colour ramps, type scale, spacing & radius |
| **Brand** | — | logo (SVG + PNG), usage rules, brand voice & personas |

Component names follow **shadcn's** naming, not our earlier custom names (`Input` not `TextField`, `Select` not `Dropdown`, `RadioGroup` not `RadioButton`, `InputOTP` not `OtpField`).

---

## Explore it first (testers — start here)

The fastest way to see the whole system running. No auth, no package registry.

```bash
git clone https://github.com/yokesh-2one/2one-design-library.git
cd 2one-design-library
npm install          # .npmrc in the repo handles peer-dep resolution
npm run dev          # live showcase at http://localhost:4180
```

That opens the showcase — every component, the foundations (colour, type, radius), the templates and charts — rendered from source. To poke at the machine-readable data an AI would use: open [`manifest.json`](manifest.json), [`tokens/colors.json`](tokens/colors.json), and [`guide-app/knowledge-base.md`](guide-app/knowledge-base.md).

**Requirements:** Node 18+ (React 18/19 + Tailwind v4 only matter when you consume it in your own app, below).

---

## Use it in your own app (developers)

### 1. Install the package

```bash
npm install @2one/design-library react react-dom
```

No token, no registry configuration, no `.npmrc` — it installs anonymously from
the public npm registry like any other package.

### 2. Wire up the theme + Tailwind

The components are plain React + Tailwind classes; your app's Tailwind has to **see** those classes to generate the CSS. Import the theme once and point Tailwind at the package:

```css
/* app.css (or globals.css) */
@import 'tailwindcss';
@import '@2one/design-library/styles';        /* 2one tokens, variables, fonts */
@source '../node_modules/@2one/design-library/dist';  /* scan the components */
```

Import that CSS once at your app root:

```tsx
// main.tsx / layout.tsx
import './app.css'
```

### 3. Use a component

```tsx
import { Button, Input, Label } from '@2one/design-library'

export function SignIn() {
  return (
    <form className="grid gap-4 max-w-sm">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Button type="submit">Continue</Button>   {/* one primary per view */}
    </form>
  )
}
```

That's it — the Button renders as a black pill, the Input picks up the 2one greys, and headings use Satoshi.

---

## Using components

Everything is a normal React component with typed props. A few common ones:

```tsx
import {
  Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  Switch, Badge, Tabs, TabsList, TabsTrigger, TabsContent,
} from '@2one/design-library'

// Buttons — variants: default | secondary | outline | ghost | destructive | link
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>

// Select
<Select>
  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="in">India</SelectItem>
    <SelectItem value="us">United States</SelectItem>
  </SelectContent>
</Select>

// Dialog
<Dialog>
  <DialogTrigger asChild><Button variant="outline">Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Upgrade to Pro</DialogTitle></DialogHeader>
  </DialogContent>
</Dialog>

// Switch + Badge
<Switch defaultChecked />
<Badge variant="destructive">Error</Badge>
```

Icons come from [`lucide-react`](https://lucide.dev) (shadcn's default). Import them directly:

```tsx
import { Rocket } from 'lucide-react'
<Button><Rocket /> Launch</Button>
```

> **Full, live catalogue:** run the [dev showcase](#local-development) — every component, every state, plus the foundations and templates, on one page.

---

## Theming & design tokens

The whole look is driven by **CSS variables** defined in [`src/styles/globals.css`](src/styles/globals.css). The 2one raw tokens (in [`tokens/`](tokens)) feed shadcn's variable contract:

| shadcn variable | 2one value | Meaning |
| --- | --- | --- |
| `--background` / `--foreground` | `#ffffff` / `#09090b` | page & text |
| `--primary` / `--primary-foreground` | neutral-950 / accent-50 | primary button |
| `--secondary` · `--muted` · `--accent` | neutral-100 | quiet surfaces |
| `--muted-foreground` | neutral-600 | secondary text |
| `--border` / `--input` | neutral-200 | lines & fields |
| `--ring` | neutral-400 | focus ring |
| `--destructive` | **danger-600** `#dc2626` | validation error **only** |
| `--success` | **success-600** `#15803d` | validation success **only** |
| `--chart-1…5` | grayscale ramp | charts (no hues) |

**To re-theme:** edit the values in `globals.css` (or the ramps in `tokens/`) — every component updates at once. Don't hard-code colours in components; use the variables.

**Two themes: light + dark.** Both are grayscale and both are APCA-audited. `globals.css` defines the light palette on `:root` and the dark palette on `.dark`. Switch them with the exported `ThemeProvider` (it toggles the `.dark` class) — don't hand-roll a third palette or a brand hue. `npm run a11y` audits **both** themes and fails below threshold, so any token change must clear it twice.

### The token files

- [`tokens/colors.css`](tokens/colors.css) — the ramps: `accent-*`, `neutral-*`, and the two semantic hues `danger-*` / `success-*`.
- [`tokens/typography.css`](tokens/typography.css) — the type scale: `--text-display` down to `--text-xs`, with real sizes & line-heights, plus font families.
- [`tokens/spacing.css`](tokens/spacing.css) — spacing steps and the radius scale (`--radius-xs` 2px → `--radius-full` 999px).

### Taking the tokens outside the web stack

[`tokens/tokens.dtcg.json`](tokens/tokens.dtcg.json) is the same set in **W3C DTCG**
format — the neutral interchange format design tools understand. Use it to carry
2one into Figma, or to drive a non-Tailwind UI framework from the same source.

| Group | Contents |
| --- | --- |
| `color` | primitive ramps (theme-independent) |
| `light` / `dark` | semantic sets — apply one at a time |
| `font` | families, weights, sizes, line-heights |
| `text` | **composite typography tokens** → become real Figma text styles |
| `dimension` | spacing + radius, normalised to px |

Semantic tokens **alias** their ramp step (`{color.neutral.950}`) rather than
duplicating the hex, so the relationship survives into Figma as a variable
reference. 25 of 34 light tokens alias cleanly; the rest are values that sit off
the ramps and are emitted as literals — `npm run tokens` lists them.

**Into Figma:** Tokens Studio → Import → paste/point at the file → push as
variables. **Into another platform:** feed it to Style Dictionary.

> Generated — never hand-edit. `npm run tokens` rebuilds it from the CSS, and CI's
> `check:meta` fails if the committed copy is stale.

These generate Tailwind utilities too: `bg-neutral-700`, `text-h1`, `rounded-2xl`, etc.

---

## Typography & fonts

| Role | Typeface | Token |
| --- | --- | --- |
| Headings | **Satoshi** (Bold) | `--font-heading` |
| Body & UI | **Inter** | `--font-sans` |

Both are **self-hosted** — no CDN, no network dependency:

- **Satoshi** ships as `.woff2` in [`src/styles/fonts/`](src/styles/fonts) and is declared via `@font-face` in `globals.css`.
- **Inter** comes from `@fontsource-variable/inter`, imported by `globals.css`.

Because they're bundled into the published `styles`, consumers get the real fonts automatically — no extra setup.

---

## The 2one-only components

Three things shadcn doesn't provide, built to the same token system:

| Component | What it is | Key props |
| --- | --- | --- |
| **`Logo`** | The 2one wordmark. Brand identification only — never decorative. | `variant: 'black' \| 'white'`, `width?` |
| **`AppBar`** | Mobile top navigation bar, 64px tall, centred title. | `title`, `onBack?`, `trailingSlot?` |
| **`BottomNavItem`** | One tab in a mobile bottom nav (icon + label). Compose several in a row. | `icon`, `label`, `selected?`, `onClick?` |

```tsx
import { Logo, AppBar, BottomNavItem } from '@2one/design-library'

<Logo variant="black" width={120} />   {/* black on light, white on dark — never recoloured */}
<AppBar title="Sign in" onBack={() => history.back()} />
```

---

## Templates (blocks)

Pre-assembled screens in [`src/blocks/`](src/blocks), ready to copy into an app and adjust:

| Block | What it is |
| --- | --- |
| `login-01` … `login-05` | Five sign-in screen variations |
| `signup-01` … `signup-03` | Three sign-up forms |
| `dashboard-plain` | A dashboard **without** any sidebar/menu — stat cards + area chart + data table |

> Blocks are **templates, not package exports** — you copy the files into your project and edit them, rather than `import`-ing them from the package. They've been stripped of shadcn's placeholder branding (no "Acme Inc").

---

## Adding or updating a component

This library is built with the **shadcn CLI**, configured in [`components.json`](components.json) (`style: new-york`, `baseColor: neutral`). To add a component:

```bash
npx shadcn@latest add <component>
```

It lands in `src/components/ui/`, already picking up the 2one theme. See [Troubleshooting](#troubleshooting--gotchas) for two quirks the CLI introduces on every run.

---

## Project structure

```
2one-design-library/
├── src/
│   ├── components/
│   │   ├── ui/              54 shadcn primitives, 2one-themed  (button.tsx, dialog.tsx, …)
│   │   ├── logo.tsx         2one-only ─┐
│   │   ├── app-bar.tsx      2one-only  │ mobile / brand
│   │   └── bottom-nav-item.tsx  2one-only ─┘
│   ├── blocks/              templates (login-*, signup-*, dashboard-plain/)
│   ├── lib/utils.ts         the cn() classname helper
│   ├── styles/
│   │   ├── globals.css      THE THEME — tokens → shadcn variables + @font-face
│   │   └── fonts/           Satoshi (.woff2)
│   └── index.ts             public entry — re-exports all 57 components
├── tokens/                  design tokens — CSS (Tailwind) + generated JSON
│   ├── colors.{css,json}    ramps + semantic + WCAG/APCA contrast data
│   ├── typography.{css,json}  fonts + type scale
│   └── spacing.{css,json}   spacing + radius scale
├── brand/
│   ├── brand.json           Tier 1 structured (mission, voice, tone, personas)
│   ├── BRAND.md             prose version
│   └── logo/                SVG + PNG + manifest (usage rules)
├── guide-app/               local Q&A knowledge base + version log + feedback
├── schema/                  JSON schemas (token, component) + validation
├── recipes/                 how to build an app / website / marketing / deck
├── dev/                     local showcase app (npm run dev)
├── manifest.json            READ FIRST — machine index + instructions_for_ai
├── components.json          shadcn CLI config
├── registry.json            machine index (theme map, conventions, overrides)
├── AGENTS.md · llms.txt     AI entry points
└── vite.config.ts · vite.config.dev.ts · tsconfig.json
```

---

## Local development

```bash
npm install          # install deps (uses .npmrc → legacy-peer-deps)
npm run dev          # live showcase at http://localhost:4180
npm run typecheck    # tsc --noEmit
npm run build        # produce dist/  (see below)
npm run storybook    # Storybook at http://localhost:6006
```

`npm run dev` serves [`dev/`](dev) — a monochrome editorial showcase of every component, the foundations (colour, type, radius), and the templates. It imports the components from source, so it's always current.

---

## Building & publishing

```bash
npm run build
```

The build does four things:

1. **`vite build`** — compiles each component to ESM + CJS in `dist/` (React is external; modules are preserved so consumers only pull what they import).
2. **`tsc --emitDeclarationOnly`** — emits TypeScript declarations (`.d.ts`).
3. **`tsc-alias`** — rewrites the build-time `@/` path aliases in the `.d.ts` to relative paths *(without this, consumer types break — see Troubleshooting)*.
4. **`copy-styles.mjs`** — copies `globals.css` → `dist/styles.css` and the fonts + token files into `dist/`.

Output: `dist/index.js` · `dist/index.cjs` · `dist/index.d.ts` · `dist/styles.css` · `dist/fonts/*` · `dist/tokens/*`.

Publishing goes to the **public npm registry** (`publishConfig.access: "public"`),
so consumers install anonymously:

```bash
npm publish
```

---

## For AI agents

This repo is written to be machine-read. Point any AI vendor at these, in order:

1. **[`manifest.json`](manifest.json) — READ FIRST.** The machine-readable index of everything, plus the **`instructions_for_ai`** contract: answer only from repo content, cite the file used, and say explicitly when something isn't here — **never fabricate a brand fact**.
2. [`tokens/*.json`](tokens) — canonical colours (with WCAG + APCA **contrast data**), type, spacing. Pull exact values from here; never invent look-alikes.
3. [`brand/brand.json`](brand/brand.json) — mission, voice, tone, personas (structured), so generated copy is on-brand.
4. [`guide-app/knowledge-base.md`](guide-app/knowledge-base.md) — local Q&A source (works offline); [`VERSIONLOG.md`](guide-app/VERSIONLOG.md) — what's available vs. planned.
5. [`AGENTS.md`](AGENTS.md) · [`registry.json`](registry.json) · [`llms.txt`](llms.txt) — rules, theme map, pointer.

The machine-readable data is **generated, not hand-kept** (no drift): `npm run tokens`, `npm run manifest`, validated by `npm run validate`. The contract for agents: **answer only from the repo, cite the file, use shadcn names, obey the tokens, match the brand voice — never guess a brand fact.**

---

## Design rules

A few constraints that make output read as "2one" rather than generic shadcn:

- **Monochrome.** No brand hue anywhere. `danger` (red) and `success` (green) appear **only** on validation states.
- **Pill buttons.** Buttons use `--radius-full`. This is the signature — enforced in `globals.css` so it survives CLI regenerations.
- **One primary per view.** Highest-weight action used once; pair a `secondary` with it for lesser actions.
- **Logo is sacred.** Never recolour, rotate, distort, or add effects. Black on light, white on dark, min width 96px.
- **Two audited themes.** Light and dark both ship. Theme through `ThemeProvider` and the tokens — never a third palette or an ad-hoc `dark:` hack.

---

## Troubleshooting & gotchas

**Consumer TypeScript errors about missing `size`/`variant`.**
The published `.d.ts` must have relative imports, not `@/`. This is handled by `tsc-alias` in the build. If you fork the build and drop that step, consumer types collapse to `any` and props wrongly become required. Keep `tsc-alias`.

**`shadcn add` reverts the pill button.**
Every `npx shadcn add` regenerates `button.tsx` with `rounded-md`. The pill is re-applied via an **unlayered** rule in `globals.css` (`[data-slot="button"] { border-radius: var(--radius-full) }`), which wins over the utility — so the button stays a pill without editing the component. Nothing to do.

**`shadcn add` re-injects a blue `.dark { … }` block.**
The CLI appends its own sidebar dark palette (with a blue accent) to `globals.css` on some adds. It is **not** the 2one dark theme — it introduces a brand hue and will fight the audited palette. **Delete it after running the CLI**, and re-run `npm run a11y` to confirm both themes still pass.

**Importing the package barrel drags in heavy deps.**
`import { X } from '@2one/design-library'` pulls the whole graph (including `Chart` → `recharts`). All required deps are declared, but if you see an unresolved transitive dep, install it. (A future improvement is subpath exports so consumers pull only what they use.)

**Fonts 403 in a local symlinked/`file:` setup.**
If you consume the package via a `file:`/symlink dep, your dev server may refuse to serve the fonts from outside its root. Add the library path to your bundler's filesystem allow-list. A normal `npm install` doesn't hit this.

---

## FAQ

**Is this just shadcn/ui?**
It's **built on** shadcn/ui, then re-skinned to the 2one tokens and extended with 2one-only components, templates, brand, and AI context. shadcn is the foundation; 2one is the identity.

**Can I use it without Tailwind?**
No — the components ship as Tailwind classes. Your app must run **Tailwind v4** and scan the package (the `@source` line above).

**Does it support dark mode?**
Yes. Light and dark ship together, both grayscale and both APCA-audited. Wrap your app in the exported `ThemeProvider` to switch between them.

**Where's the visual reference?**
Run `npm run dev` for the live showcase, or open Storybook with `npm run storybook`.

---

## Credits & licensing

- **Components:** [shadcn/ui](https://ui.shadcn.com) (MIT), *new-york* style, `baseColor: neutral`, on [Radix UI](https://www.radix-ui.com) primitives.
- **Icons:** [lucide](https://lucide.dev).
- **Fonts:** [Satoshi](https://www.fontshare.com/fonts/satoshi) (Fontshare) + [Inter](https://rsms.me/inter/) (self-hosted via `@fontsource-variable/inter`).
- **Tokens, brand & 2one-only components:** © 2one Solutions.

> **Licensing — read before redistributing.** This repository currently ships an MIT [`LICENSE`](LICENSE) file, and `package.json` declares `"license": "MIT"`. **The final licensing terms for the 2one tokens, brand assets, and original components are still being decided** — the 2one logo and brand are trademarks of 2one Solutions regardless of the code license. If you are evaluating this repo, treat the brand assets as 2one's property and check with 2one before redistributing or rebranding. The underlying shadcn/Radix/lucide/font projects retain their own licenses.

---

<div align="center">

*Building business value by improving customer & user experience.*
**2one Solutions** — creating structure in an unstructured world.

</div>
