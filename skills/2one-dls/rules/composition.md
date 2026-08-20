# Composition rules — layout, containers, spacing, hierarchy

Checked by `npx 2one check`. Rule ids in brackets.

## Build FROM the library, never beside it `[handrolled-card]`

Before writing a `<div>` with borders and padding, check whether the component
exists. It almost always does — 57 of them.

❌ **Wrong** — a parallel container
```tsx
<div className="rounded-xl border bg-white p-6 shadow-sm">
  <h3 className="mb-2 text-lg font-semibold">Notifications</h3>
  …
</div>
```

✅ **Right**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

The same applies to sidebars (`Sidebar`), form rows (`Field`), empty states
(`Empty`), and list rows (`Item`). If you are writing CSS for something the
library provides, stop.

**Never nest a Card inside a Card.** Two borders and two shadows read as a bug.

## One primary action per view `[multiple-primary-buttons]`

❌ **Wrong** — two primaries, so neither reads as the action
```tsx
<Button>Save</Button>
<Button>Publish</Button>
```

✅ **Right**
```tsx
<Button>Publish</Button>
<Button variant="outline">Save draft</Button>
```

Variants: `default` (primary) · `secondary` · `outline` · `ghost` ·
`destructive` · `link`. A `<Button>` with no `variant` **is** the primary.

## One spacing scale `[inline-spacing]` `[off-scale-spacing]`

Inconsistent gaps are the single most visible "AI-generated" tell.

❌ **Wrong**
```tsx
<div style={{ marginTop: 18, padding: 14 }}>
<div className="mt-[13px] gap-[7px]">
```

✅ **Right**
```tsx
<div className="mt-4 p-4">
<div className="mt-3 gap-2">
```

Use the 4/8px scale through Tailwind utilities — `gap-4`, `mt-6`, `p-6`,
`space-y-4`. No inline margins, no arbitrary pixel values mixing 14/18/26px.

## Cap width by content type, not by page

A `max-width` keeps **long-form text** readable (~65–75 characters). It is the
wrong default for an application layout.

❌ **Wrong** — half a large monitor wasted on gutters
```tsx
<div className="mx-auto max-w-5xl">
  <DashboardGrid />
</div>
```

✅ **Right** — generous cap for the app, tight cap on the prose inside it
```tsx
<div className="mx-auto max-w-7xl px-6">
  <p className="max-w-[60ch]">Long explanatory copy…</p>
  <DashboardGrid />
</div>
```

## Theming

Light and dark both ship, both APCA-audited. Switch with the exported
`ThemeProvider` — it toggles the `.dark` class. Never hand-roll a third palette,
a brand hue, or `data-*` dark hacks.

Dark is not "invert and ship": every surface×text pair changes. If you alter any
token, `npm run a11y` must pass in **both** themes. Keep component colours
token-driven — a component that hardcodes `text-white` diverges from the audited
token, so the audit passes green while the button is unreadable.

## Two Tailwind traps

**Classes are only generated if the scanner sees them.** A class written in a
folder Tailwind never `@source`s is never generated at all. Canary: an arbitrary
value used exactly once (`h-[250px]`) — if it appears to do nothing, it was
never emitted.

**`@theme` vars are tree-shaken when unused.** Reading `var(--color-neutral-250)`
at runtime returns empty unless some utility references it. Prefer the semantic
tokens (`--primary`, `--muted`), which are always live; if you must paint from a
raw ramp var, safelist the literal class names in a hidden element.

## Verify the render

Compiling is not "done." Look at the page — at multiple widths and in **both**
themes — checking dialogs, inputs, cards, tables, a chart, and brand marks. The
contrast audit has passed green while a dark destructive button was unreadable
and the logo was invisible. Only looking caught them.
