# Decision: `suppressed-focus-ring` cannot tell a focus container from a control

**Status: ACCEPTED limitation — recorded, not fixed.** The detector stays as it
is. `src/components/ui/dialog.tsx` keeps `outline-none` and keeps being reported.

## The finding

`check-usage` reports one error against the library it governs:

```
src/components/ui/dialog.tsx:62  suppressed-focus-ring
  outline cleared on this element with no visible focus treatment to replace it
```

The element is `DialogPrimitive.Content`. It carries `outline-none` and no
`focus-visible:` treatment, which is exactly the shape the rule exists to catch.

## Why it is not a defect

`DialogPrimitive.Content` is a focus **container**, not a control. Radix moves
focus to it programmatically when the dialog opens so that screen readers
announce the dialog and so the focus trap has an anchor. It is never reached by
tabbing, and the user never chose to focus it.

Giving it a visible ring would therefore draw a focus outline around the whole
panel every time any dialog opens. That is a visible regression, and it is worse
than the thing the rule is protecting against: it trains people to ignore focus
rings, which is the failure mode `suppressed-focus-ring` exists to prevent.

The `outline-none` is correct here.

## Why no detector signal was invented

The obvious fix is to teach the detector about containers: exempt anything with
`role="dialog"`, `tabIndex={-1}`, or a name matching a Radix `*Content`
primitive. Each of those is a guess dressed as a rule.

- `role` is not in the class string the detector reads, and is often implicit.
- `tabIndex={-1}` marks plenty of things that are not focus containers.
- Matching component names binds the engine to one UI library's naming, which is
  payload knowledge in the engine, and the seam exists to keep it out.

A heuristic that is right for this file and wrong elsewhere converts a true
positive into silence in cases nobody has looked at yet. A detector that goes
quiet for the wrong reason is indistinguishable from one that rotted, which is
the failure this whole checker was built to avoid.

So the finding stands, and the reason it stands is written down here.

## What this costs

One known error in `src/components`. Anyone adding `src/components` to the
default scan must account for it: either the gate tolerates exactly this
finding, or the run is not clean. It must not be made to disappear by loosening
the rule.

## What would change this

A detector that reads the element's props rather than only its class string
could ask whether the element is programmatically focused and never tabbable.
That is a real signal rather than a guess, and it needs a parser, not a regex.
Worth revisiting if a second genuine container case appears; one instance does
not justify the machinery.

## Related

- `rules/ux-rules.json` → `visible-focus`
- `docs/accessibility.md`
- `docs/decisions/expressive-warmth-for-consumer-personas.md` for the format
