# Consuming the 2one DLS in your app

The exact, end-to-end setup for using `@yokesh-2one/design-library` in a fresh
Vite + React + Tailwind v4 app. Following this verbatim yields a themed, pill-radius
`Button` with working light/dark — and **no unstyled flash**.

> **Status:** the package builds locally but is **not yet on a public registry**.
> Use path **A (local tarball)** today; path **B (registry)** is for when it's
> published. Either way, the theme + Tailwind wiring in step 2 is identical and is
> the part consumers most often get wrong.

## Requirements

- **React 18 or 19** (`react`, `react-dom` are peer deps).
- **Tailwind CSS v4** in your app (e.g. `@tailwindcss/vite`). The components ship as
  Tailwind class *strings*; your app's Tailwind is what compiles them to CSS.
- Node 18+.

`next-themes` (for `<ThemeProvider>`) and every other runtime dep are **bundled** —
you don't install them separately.

## 1 · Get the package

### A · Local tarball (works today, no registry)

In a clone of this repo, build the library and pack it:

```bash
npm install
npm run build     # emits dist/ (ES + CJS + types + styles + fonts)
npm pack          # → yokesh-2one-design-library-0.1.0.tgz
```

Then, in your app, install the tarball plus the React peers:

```bash
npm install /path/to/2one-design-library/yokesh-2one-design-library-0.1.0.tgz react react-dom
```

### B · Registry install (when published)

Once published to GitHub Packages, add an `.npmrc` next to your `package.json`
(GitHub Packages needs a token with `read:packages`, even for public repos):

```ini
@yokesh-2one:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @yokesh-2one/design-library react react-dom
```

### C · Vendor the source (fallback)

If you can't install a package at all, copy `src/components/`, `src/lib/`,
`src/styles/globals.css`, and `tokens/` into your app and import from your local
path instead of the package name. You then own the copies (shadcn-style).

## 2 · Wire the theme + Tailwind  ← the #1 silent failure

The components are plain React + Tailwind classes. **Your app's Tailwind has to _see_
those class strings to generate the CSS.** Import the theme once, and point Tailwind
at the package's `dist` with `@source`:

```css
/* app.css */
@import 'tailwindcss';
@import '@yokesh-2one/design-library/styles';               /* 2one tokens, variables, fonts */
@source '../node_modules/@yokesh-2one/design-library/dist'; /* scan the components' classes */
```

> **If you skip the `@source` line, you get a silent failure:** the components render
> with their class names but Tailwind never generated those utilities, so the UI is
> **unstyled with no error**. This is the single most common consumer mistake — if your
> `Button` looks like a plain browser button, this line is missing or the path is wrong.

Import that CSS once at your app root:

```tsx
// main.tsx
import './app.css'
```

## 3 · Add the ThemeProvider (light + dark)

Wrap your app so the audited `.dark` palette can activate (`<ThemeProvider>` adds the
`.dark` class via `next-themes`; default is `light`):

```tsx
import { ThemeProvider } from '@yokesh-2one/design-library'

export function Root() {
  return (
    <ThemeProvider>          {/* defaultTheme="light"; pass enableSystem / defaultTheme to change */}
      <App />
    </ThemeProvider>
  )
}
```

## 4 · Use a component

```tsx
import { Button } from '@yokesh-2one/design-library'

export function Example() {
  return <Button>Continue</Button>   // renders as a pill (radius-full), 2one-themed
}
```

## Verify it worked

- The `Button` is a **pill** (fully rounded), not a square browser button → step 2 worked.
- Toggling the theme (via `next-themes`' `useTheme().setTheme('dark')`) flips the whole
  UI to the audited dark palette → step 3 worked.
- If the button is unstyled: the `@source` line in step 2 is missing or its path is wrong.

## Troubleshooting

- **Unstyled components, no error** → missing/incorrect `@source` (step 2).
- **Fonts 403 with a `file:`/symlinked dep** → add the package path to your bundler's
  filesystem allow-list (Vite: `server.fs.allow`). A normal install doesn't hit this.
- **Consumer TS props become `any`/required** → the published `.d.ts` must use relative
  imports (handled by `tsc-alias` in the library build); don't drop that step if you fork.
- **Barrel drags in `recharts`** (via `Chart`) → all deps are declared; this is expected
  until per-component subpath exports land. Run `npm run what-uses recharts` in the DLS
  repo to see exactly which components pull it.

## Publishing this package (maintainers)

The package isn't on a public registry yet. Release checklist for when it is:

1. Bump `version` in `package.json` and update `CHANGELOG.md`.
2. `npm run build:meta && npm run typecheck && npm run check:exports && npm run validate && npm run a11y && npm run build` — all green.
3. `npm pack` and smoke-test the tarball against this guide (step 1A) in a blank app —
   confirm a pill `Button` and working dark, **no unstyled flash**. Any runtime CSS
   `@import` in `dist/styles.css` (e.g. `tw-animate-css`) must be a **`dependency`**, not
   a devDependency, or the consumer's build can't resolve it.
4. `npm publish` (scope points at GitHub Packages via `publishConfig.registry`).
5. Confirm `npm view @yokesh-2one/design-library version` resolves, then flip the README /
   AGENTS / `docs/consuming.md` wording from "not yet on a public registry" to published.
