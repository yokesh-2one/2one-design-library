# Form rules — fields, validation, accessible state

Checked by `npx 2one check`. Rule ids in brackets.

## Use Field, not hand-built rows

❌ **Wrong**
```tsx
<div className="mb-4">
  <label className="mb-1 block text-sm">Email</label>
  <input className="w-full rounded border px-3 py-2" />
</div>
```

✅ **Right**
```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" name="email" type="email" autoComplete="email" required />
  </Field>
</FieldGroup>
```

`FieldGroup` owns the rhythm between rows, so no manual margins. Always pair
`FieldLabel htmlFor` with the input `id` — a placeholder is not a label and
disappears the moment someone types.

Set `type` and `autoComplete` honestly: `type="email"` + `autoComplete="email"`,
`type="password"` + `autoComplete="current-password"` (or `new-password` on
sign-up). This is what makes password managers and mobile keyboards behave.

## Never signal state by colour alone `[color-only-state]`

Non-negotiable — a brand rule *and* an accessibility rule. A red border is not a
message: it is invisible to a colourblind user and silent to a screen reader.

❌ **Wrong**
```tsx
<Input className="border-destructive" />
```

✅ **Right**
```tsx
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input
    id="email"
    aria-invalid
    aria-describedby="email-error"
    defaultValue="not-an-email"
  />
  <FieldError id="email-error">Enter a valid email address.</FieldError>
</Field>
```

The error text carries the meaning; the colour reinforces it. `aria-invalid`
announces the state, `aria-describedby` ties the message to the field.

**Show invalid only after a failed validation**, never on first paint. For
persistent guidance use `FieldDescription` — and don't show both at once, since
an error replaces the hint rather than stacking with it.

## Don't combine disabled with invalid

A field cannot be both "you must fix this" and "you cannot touch this". The same
applies to `Select`, `Checkbox`, and `RadioGroup`.

## One primary action

A form has exactly one submit. Federated sign-in, "save draft", and "cancel" are
`outline`, `secondary`, or `ghost` — never a second primary.

```tsx
<Field>
  <Button type="submit">Continue</Button>
  <Button variant="outline" type="button">Use a different method</Button>
</Field>
```

Give the button a real verb. "Continue", "Create account", "Send invite" — not
"Submit".

## Component names

shadcn names, not the pre-2026 custom ones:

| Use | Not |
| --- | --- |
| `Input` | ~~TextField~~ |
| `Select` | ~~Dropdown~~ |
| `RadioGroup` | ~~RadioButton~~ |
| `InputOTP` | ~~OtpField~~ |

Run `npx 2one info --json` for the authoritative list in this project.

## Switch vs Checkbox

`Switch` is for a setting that takes effect **immediately**. `Checkbox` is for a
value **submitted with the form** — terms acceptance, multi-select. A Switch
inside a form that needs a Save button is the wrong control.
