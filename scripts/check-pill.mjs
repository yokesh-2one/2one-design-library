/*
  check:pill — the 2one signature (buttons are pills) must survive Radix `asChild`.

  The pill comes from an UNLAYERED [data-slot="button"] rule in src/styles/globals.css.
  When a <Button> is used as an asChild trigger (TooltipTrigger, DropdownMenuTrigger,
  SheetTrigger, PopoverTrigger, DialogTrigger, …), Radix Slot swaps data-slot to the
  trigger's own value, so [data-slot="button"] no longer matches and the button falls
  back to the cva base rounded-md. A bar mixing wrapped and unwrapped buttons then
  looks inconsistent — a real defect a video-conferencing app shipped, invisible to
  typecheck, build and check-usage. The fix re-asserts radius-full on the
  button-bearing trigger slots, scoped [data-variant] so only real Buttons match.

  This guards that fix: every button-bearing trigger slot must re-assert the pill,
  and select-trigger (an input-like field) must NOT. There is no browser test env in
  this repo, so this asserts the CSS INVARIANT rather than a computed radius; the
  rendered radius is confirmed by eye (see the PR). Run: npm run check:pill
*/
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { config as cfg } from './lib/config.mjs'

// Root at the PAYLOAD, not at this file. Resolving from the script directory
// meant a client run read 2one's files and reported on them.
const root = cfg.root
// Strip comments first so selector text in a comment can't pollute the parse.
const css = readFileSync(join(root, cfg.rel('theme')), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

// Every selector whose rule sets a full pill radius.
const pill = new Set()
for (const m of css.matchAll(/([^{}]+?)\{\s*border-radius:\s*var\(--radius-full\)/g))
  for (const sel of m[1].split(',')) pill.add(sel.trim().replace(/\s+/g, ''))
const has = (sel) => pill.has(sel.replace(/\s+/g, ''))

// The Radix overlay triggers that commonly wrap a <Button> and so apply their own
// data-slot. Select is deliberately absent — its trigger is an input-like field.
const TRIGGERS = ['tooltip', 'popover', 'dropdown-menu', 'context-menu', 'menubar', 'dialog', 'alert-dialog', 'sheet', 'drawer', 'hover-card', 'collapsible']

const errors = []
if (!has('[data-slot="button"]'))
  errors.push('base pill rule `[data-slot="button"] { border-radius: var(--radius-full) }` is missing')
for (const t of TRIGGERS) {
  const sel = `[data-slot="${t}-trigger"][data-variant]`
  if (!has(sel))
    errors.push(`a <Button> used as a ${t} asChild trigger will render rounded-md — globals.css must re-assert the pill. Add selector: ${sel}`)
}
if ([...pill].some((s) => s.includes('select-trigger')))
  errors.push('select-trigger is receiving radius-full — it is input-like and must keep radius-md')

if (errors.length) {
  console.error('\n  ✗ check:pill — the pill signature is not fully protected:\n')
  for (const e of errors) console.error(`    • ${e}`)
  console.error('')
  process.exit(1)
}
console.log(`  ✓ check:pill — base pill + ${TRIGGERS.length} button-bearing trigger slots re-assert radius-full; select-trigger excluded.`)
