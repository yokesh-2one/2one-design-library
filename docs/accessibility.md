# Accessibility — build rules for the 2one DLS

Accessibility is checked **while building**, not bolted on after. This page is the
ruleset; the machine check is `npm run a11y`.

---

## Contrast — the two-layer approach

We treat contrast as two checks layered together:

1. **WCAG 2.x AA** is the practical baseline. AAA is for more severe visual
   conditions — a target for specific cases, **not** a blanket default.
2. **APCA** (WCAG 3.0 *draft*) is an **additional** perceptual check layered on
   top — not a replacement yet (it's still draft).

> The math can lie. A pair can pass the WCAG ratio and still read poorly. **Test
> actual readability**, don't just clear the formula — and leave margin rather than
> hugging a threshold.

### APCA Lc thresholds

APCA reports a perceptual **Lc** score (not a fixed ratio), accounts for
**polarity** (light-on-dark ≠ dark-on-light), and expects you to weigh **font size
+ weight** together when deciding what a given text needs.

| Lc | Applies to |
| --- | --- |
| **90** | Large bold headings / colour blocks (soft ceiling) |
| **75** | Body text — minimum |
| **60** | Labels / captions |
| **45** | Large or heavy headings only |
| **30** | Floor — placeholder / disabled text only |
| **15** | Floor — non-text UI (icons, borders, focus rings) |

Source: [APCA / colorcontrast.org](https://www.colorcontrast.org).

---

## Colour is never the only signal

From *"There is no 'Myth of Colour Contrast Accessibility'"* (Geoffrey Crofte):

- **Never use colour alone** to convey information or state. Always add a second
  cue — an icon, text, underline, or shape.
  - An **invalid field** must show an icon and/or message, not just a red border/ring.
  - **Success/error** states pair the colour with an icon (shadcn `Alert` already does).
  - In charts, distinguish series by **label/pattern/position**, not colour alone
    (the 2one chart ramp is grayscale, so this is mandatory, not optional).
- **Grey / secondary buttons can be accessible without reading as "disabled"** —
  give them a clear affordance (border, label weight, hover/focus state), not just
  a contrast tweak. Don't let a real control look inert.
- **AA is the baseline**, AAA is situational.

---

## What the check covers (and what it can't)

`npm run a11y` ([`scripts/apca-audit.mjs`](../scripts/apca-audit.mjs)) parses the
semantic tokens from `src/styles/globals.css` and audits the key pairs in **both
themes** — the light `:root` block **and** the dark `.dark` block:

```
npm run a11y      # exits 1 if ANY pair, in EITHER theme, is below its Lc threshold
```

It audits the pairs the components **actually render**, on **every surface** — text
on `background`/`card`/`popover`/`secondary`/`accent`/`sidebar`, muted text on each of
those, error text on cards, and non-text UI (borders, rings) on each surface they sit
on. It does **not** yet measure the rendered DOM (opacity compositing), so keep
components token-driven — see the lesson below. It still **cannot** check the human
rules above ("colour alone", real-world readability, affordance).

> **Lesson (why this matrix is wide).** A narrow 10-pair, token-only check once passed
> while the dark destructive button rendered **white on pale-pink at Lc 24** — because
> `button`/`badge` hardcoded `text-white` and `dark:bg-destructive/60`, which the token
> pair never saw. Fix: the components now use `text-destructive-foreground` on a **solid**
> `--destructive` (no opacity), so the audited pair equals the render — and the matrix
> covers every surface, not a hand-picked few. **Rule: a token-pair audit is only honest
> if components render those exact pairs. Keep component colours token-driven; never
> hardcode a foreground or bake in an opacity the audit can't see.**

### Dark theme

The dark theme uses the **same thresholds** as light; APCA already accounts for
polarity, so light-on-dark is judged on the same Lc scale. The audit fails if the
`.dark` block is missing. Notable dark values, all chosen to clear the thresholds
**on every surface** (not just the background):

| Token (dark) | Value | Why |
| --- | --- | --- |
| `--muted`/`--secondary`/`--accent` | `#27272a` | One value (as in light) — no ad-hoc drift between near-identical greys. |
| `--muted-foreground` | `#c2c2c8` | Lightened so muted text clears **Lc 60** on the muted surface. |
| `--border` / `--input` / `--sidebar-border` | `#606069` | Clears the **Lc 15** non-text floor on **every** surface it sits on — `background`, `card`, and the lighter `muted`/`secondary` — not just the ground. (An earlier `#54545c` passed on the background but failed on cards at Lc 14.8.) |
| `--destructive` | `#fecaca` | Soft red so it both reads as error *text* (Lc 60) and carries a **dark** label (`--destructive-foreground #09090b`) at Lc 75. The button/badge render `text-destructive-foreground` on solid `--destructive`, so this pair is what ships. Validation only; meaning unchanged. |

### Current status

All audited pairs pass in **both** light and dark. Earlier light fixes (2026-08-10):

| Token | Was | Now | Why |
| --- | --- | --- | --- |
| `--destructive` | `#dc2626` | `#c81e1e` | White button label was Lc −73.7 (< 75). Now −82. |
| `--border` / `--input` | `#e4e4e7` | `#dcdce0` | Hairlines were Lc 13.4 (< the 15 non-text floor). Now 18. |

Re-run `npm run a11y` after **any** change to a colour token, in either theme.

## Text over media — the audit cannot help you here

`npm run a11y` audits **token pairs** (a text colour on a surface colour) parsed from
`globals.css`. It can say nothing about **text placed over an image or video**: the
pixels behind the text are arbitrary and unknown at build time, so there is *no
guaranteed contrast*. A white caption is invisible over a bright frame — and the audit
stays green the whole time.

**Rule: never put text directly over media — always lay a scrim behind it.** Use the
`--scrim` token (a translucent neutral overlay; also available as the `scrim` colour, so
`bg-scrim` / `from-scrim` work) as a solid panel or a gradient behind the text:

```tsx
<figure className="relative">
  <img src="…" alt="…" className="w-full" />
  {/* gradient scrim: transparent → --scrim toward the caption edge */}
  <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-scrim to-transparent p-4 text-white">
    Caption text stays readable over any frame.
  </figcaption>
</figure>
```

The scrim is theme-independent (media is media). Pair it with a **fixed** light text
colour (`text-white`) — this is a fixed-ground case, the same exception as brand marks in
[`building-with-the-dls.md`](building-with-the-dls.md) rule 14, not a theme token.
