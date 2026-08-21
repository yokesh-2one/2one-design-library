# Build a website

Same install and setup as an app (see build-an-app.md). The components are
plain React + Tailwind, so they drop into Next.js, Vite, Remix, or Astro (React).

- Import `@yokesh-2one/design-library/styles` once in the root layout.
- Use `Logo` for the site header/footer (`variant="black"` on light, `"white"`
  on dark — never recolored).
- Compose `NavigationMenu` or `BottomNavItem` into a nav row, or use `Button`/
  `Input` for CTAs and forms. Everything is responsive via the token scales.

Note: the site ships light + audited dark (both palettes in `globals.css`, toggled via `ThemeProvider`), and buttons are pills.
