<div align="center">

# 2one Design Language System

**One place for every piece 2one builds with — buttons, forms, layouts, colour, type, and brand — so people and AI can build products that look and feel like 2one, fast.**

Grayscale · light-only · pill buttons · Satoshi headings + Inter body
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
| **Templates (blocks)** | 8 | `login-01`…`login-05`, `signup-01`, `signup-02`, `dashboard-plain` |
| **Design tokens** | 3 files | colour ramps, type scale, spacing & radius |
| **Brand** | — | logo (SVG + PNG), usage rules, brand voice & personas |

Component names follow **shadcn's** naming, not our earlier custom names (`Input` not `TextField`, `Select` not `Dropdown`, `RadioGroup` not `RadioButton`, `InputOTP` not `OtpField`).

---

## Quick start (developers)

**Requirements:** React 18 or 19, Tailwind CSS **v4**, Node 18+.

### 1. Install

The package is published to **GitHub Packages** under the `@yokesh-2one` scope, so point that scope at GitHub's registry first. Add an `.npmrc` next to your `package.json`:

```ini
@yokesh-2one:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs the `read:packages` scope. Then:

```bash
npm install @yokesh-2one/design-library react react-dom
```

### 2. Wire up the theme + Tailwind

The components are plain React + Tailwind classes; your app's Tailwind has to **see** those classes to generate the CSS. Import the theme once and point Tailwind at the package:

```css
/* app.css (or globals.css) */
@import 'tailwindcss';
@import '@yokesh-2one/design-library/styles';        /* 2one tokens, variables, fonts */
@source '../node_modules/@yokesh-2one/design-library/dist';  /* scan the components */
```

Import that CSS once at your app root:

```tsx
// main.tsx / layout.tsx
import './app.css'
```

### 3. Use a component

```tsx
import { Button, Input, Label } from '@yokesh-2one/design-library'

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
} from '@yokesh-2one/design-library'

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

**Light-only by design.** No `.dark` palette is defined, so the `dark:` utilities the shadcn components carry never activate. (If dark mode is ever wanted, it's a matter of adding a derived `.dark { … }` block — deliberately not done today.)

### The token files

- [`tokens/colors.css`](tokens/colors.css) — the ramps: `accent-*`, `neutral-*`, and the two semantic hues `danger-*` / `success-*`.
- [`tokens/typography.css`](tokens/typography.css) — the type scale: `--text-display` down to `--text-xs`, with real sizes & line-heights, plus font families.
- [`tokens/spacing.css`](tokens/spacing.css) — spacing steps and the radius scale (`--radius-xs` 2px → `--radius-full` 999px).

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
import { Logo, AppBar, BottomNavItem } from '@yokesh-2one/design-library'

<Logo variant="black" width={120} />   {/* black on light, white on dark — never recoloured */}
<AppBar title="Sign in" onBack={() => history.back()} />
```

---

## Templates (blocks)

Pre-assembled screens in [`src/blocks/`](src/blocks), ready to copy into an app and adjust:

| Block | What it is |
| --- | --- |
| `login-01` … `login-05` | Five sign-in screen variations |
| `signup-01`, `signup-02` | Two sign-up forms |
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
├── tokens/                  raw @theme tokens (colors / typography / spacing)
├── brand/
│   ├── BRAND.md             voice, tone, personality, mission, personas
│   └── logo/                SVG + PNG + manifest (usage rules)
├── recipes/                 how to build an app / website / marketing / deck
├── dev/                     local showcase app (npm run dev)
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

Publishing targets **GitHub Packages** (`publishConfig.registry` in `package.json`):

```bash
npm publish
```

---

## For AI agents

This repo is written to be machine-read. Point any AI tool at these, in order:

1. [`AGENTS.md`](AGENTS.md) — how to work in the repo, the rules.
2. [`registry.json`](registry.json) — machine index: the component set, the token→variable **theme map**, naming **conventions**, and **overrides**.
3. [`brand/BRAND.md`](brand/BRAND.md) — voice, tone, personality, personas, so generated copy is on-brand.
4. [`llms.txt`](llms.txt) — a short pointer file summarising the above.

The rule for agents: **import from the package, use shadcn names, obey the tokens, match the brand voice.**

---

## Design rules

A few constraints that make output read as "2one" rather than generic shadcn:

- **Monochrome.** No brand hue anywhere. `danger` (red) and `success` (green) appear **only** on validation states.
- **Pill buttons.** Buttons use `--radius-full`. This is the signature — enforced in `globals.css` so it survives CLI regenerations.
- **One primary per view.** Highest-weight action used once; pair a `secondary` with it for lesser actions.
- **Logo is sacred.** Never recolour, rotate, distort, or add effects. Black on light, white on dark, min width 96px.
- **Light-only.** Don't introduce dark-mode styling ad hoc.

---

## Troubleshooting & gotchas

**Consumer TypeScript errors about missing `size`/`variant`.**
The published `.d.ts` must have relative imports, not `@/`. This is handled by `tsc-alias` in the build. If you fork the build and drop that step, consumer types collapse to `any` and props wrongly become required. Keep `tsc-alias`.

**`shadcn add` reverts the pill button.**
Every `npx shadcn add` regenerates `button.tsx` with `rounded-md`. The pill is re-applied via an **unlayered** rule in `globals.css` (`[data-slot="button"] { border-radius: var(--radius-full) }`), which wins over the utility — so the button stays a pill without editing the component. Nothing to do.

**`shadcn add` re-injects a blue `.dark { … }` block.**
The CLI appends a sidebar dark palette (with a blue accent) to `globals.css` on some adds. It's non-2one and, since we're light-only, dead. **Delete it after running the CLI.**

**Importing the package barrel drags in heavy deps.**
`import { X } from '@yokesh-2one/design-library'` pulls the whole graph (including `Chart` → `recharts`). All required deps are declared, but if you see an unresolved transitive dep, install it. (A future improvement is subpath exports so consumers pull only what they use.)

**Fonts 403 in a local symlinked/`file:` setup.**
If you consume the package via a `file:`/symlink dep, your dev server may refuse to serve the fonts from outside its root. Add the library path to your bundler's filesystem allow-list. A normal `npm install` doesn't hit this.

---

## FAQ

**Is this just shadcn/ui?**
It's **built on** shadcn/ui, then re-skinned to the 2one tokens and extended with 2one-only components, templates, brand, and AI context. shadcn is the foundation; 2one is the identity.

**Can I use it without Tailwind?**
No — the components ship as Tailwind classes. Your app must run **Tailwind v4** and scan the package (the `@source` line above).

**Does it support dark mode?**
Not today — it's intentionally light-only. Adding it is a contained change (a derived dark palette).

**Where's the visual reference?**
Run `npm run dev` for the live showcase, or open Storybook with `npm run storybook`.

---

## Credits & licensing

- **Components:** [shadcn/ui](https://ui.shadcn.com) (MIT), *new-york* style, `baseColor: neutral`, on [Radix UI](https://www.radix-ui.com) primitives.
- **Icons:** [lucide](https://lucide.dev).
- **Fonts:** [Satoshi](https://www.fontshare.com/fonts/satoshi) (Fontshare) + [Inter](https://rsms.me/inter/) (self-hosted via `@fontsource-variable/inter`).
- **Tokens, brand & 2one-only components:** © 2one Solutions.

> No open-source `LICENSE` file is included — this is a **private** 2one repository. Treat the 2one tokens, brand, and original components as proprietary; the underlying shadcn/Radix/font projects retain their own licenses.

---

<div align="center">

*Building business value by improving customer & user experience.*
**2one Solutions** — creating structure in an unstructured world.

</div>
