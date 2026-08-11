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
semantic tokens from `src/styles/globals.css` and audits the key pairs:

```
npm run a11y      # exits 1 if any pair is below its Lc threshold
```

It checks **token contrast** (text on surface, non-text UI on surface). It **cannot**
check the human rules above — "colour alone", real-world readability, affordance —
those stay a manual review item on every component and screen.

### Current status

All audited pairs pass. Two were fixed to get there (2026-08-10):

| Token | Was | Now | Why |
| --- | --- | --- | --- |
| `--destructive` | `#dc2626` | `#c81e1e` | White button label was Lc −73.7 (< 75). Now −82. |
| `--border` / `--input` | `#e4e4e7` | `#dcdce0` | Hairlines were Lc 13.4 (< the 15 non-text floor). Now 18. |

Re-run `npm run a11y` after **any** change to a colour token.
