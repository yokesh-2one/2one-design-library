# 2one Design Language System

The **2one DLS** — the [shadcn/ui](https://ui.shadcn.com) component set, re-skinned
to the 2one design tokens. Grayscale, light-only, pill buttons, Satoshi headings +
Inter body. `danger`/`success` are the only hues, reserved for validation.

It ships **54 shadcn primitives** (2one-themed) plus **3 mobile/brand components**
shadcn has no equivalent for — `Logo`, `AppBar`, `BottomNavItem`.

## Layout

```
src/components/ui/    54 shadcn primitives (Button, Input, Dialog, Tabs, …), themed to 2one
src/components/       2one-only components (logo, app-bar, bottom-nav-item)
src/styles/globals.css  the theme — 2one tokens mapped onto shadcn's CSS variables + @font-face
src/styles/fonts/     Satoshi (woff2)
src/lib/utils.ts      cn() helper
tokens/               raw @theme token files (colors / typography / spacing)
components.json       shadcn CLI config (style: new-york, baseColor: neutral)
dev/                  local sampler for verifying the theme (npm run dev)
```

## For developers

```bash
npm install @yokesh-2one/design-library
```

```tsx
import { Button, Input, Dialog } from '@yokesh-2one/design-library'
import '@yokesh-2one/design-library/styles'
```

Names follow **shadcn** (`Input`, `Select`, `RadioGroup`, `InputOTP`…). Run Tailwind
v4 and point it at the package so component utilities generate:

```css
/* app.css */
@import 'tailwindcss';
@import '@yokesh-2one/design-library/styles';
@source '../node_modules/@yokesh-2one/design-library/dist';
```

Add or update a component with the shadcn CLI (config in `components.json`):

```bash
npx shadcn@latest add <component>
```

## Theming

Everything reads from CSS variables defined in `src/styles/globals.css`, mapped 1:1
from the 2one tokens:

| shadcn variable | 2one token |
| --- | --- |
| `--primary` / `--primary-foreground` | neutral-950 / accent-50 |
| `--secondary` / `--muted` / `--accent` | neutral-100 |
| `--muted-foreground` | neutral-600 |
| `--border` / `--input` | neutral-200 |
| `--destructive` | danger-600 |
| `--success` | success-600 |

Light-only: no `.dark` palette is defined, so the `dark:` utilities the shadcn
components carry stay inert.

## Local preview

```bash
npm run dev        # sampler at http://localhost:4180 (vite.config.dev.ts)
npm run build      # library build → dist/ (ES + CJS + types + styles + fonts)
```

## Source

- Components: shadcn/ui (MIT), new-york style, `baseColor: neutral`.
- Tokens/brand: 2one Solutions — Figma *Mobile App Design System* (`YzxnyL6a69WCOw9U8WJqBo`).
- Fonts: Satoshi (Fontshare) + Inter (self-hosted via `@fontsource-variable/inter`).
