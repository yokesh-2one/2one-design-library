import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/*
  prefers-reduced-motion is honoured BY THE LIBRARY.

  The previous version of this test could not fail. It asserted that
  `matchMedia('(prefers-reduced-motion: reduce)').matches` was true, which is
  set for every project in playwright.config.ts, and that the Spinner's
  animation-duration was `0s`, which harness/theme.css forces on `*` with
  `!important` outside any media query so screenshots are deterministic.

  Both assertions passed when the library contained no reduced-motion handling
  at all. The commit that added the guard to globals.css changed nothing here,
  which is the proof: it was testing the harness.

  A false assurance about an accessibility guarantee is worse than no test,
  because it answers the question nobody re-asks. So this now inspects the
  loaded stylesheets and asserts that a reduced-motion rule exists, that it
  stills animation, and that it comes from the LIBRARY's stylesheet rather than
  the determinism shim the harness injects.
*/

const HARNESS_SHEET = 'harness/theme.css'

test('reduced-motion: the library ships the guard, not just the harness', async ({ page }, testInfo) => {
  await openCase(page, testInfo, 'button')

  const guards = await page.evaluate((harnessSheet) => {
    const found: { href: string; text: string }[] = []
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRule[]
      try {
        rules = Array.from(sheet.cssRules)
      } catch {
        continue // cross-origin sheet, not ours
      }
      for (const rule of rules) {
        if (!(rule instanceof CSSMediaRule)) continue
        if (!rule.conditionText.includes('prefers-reduced-motion')) continue
        found.push({ href: sheet.href ?? '(inline)', text: rule.cssText })
      }
    }
    return found.filter((f) => !f.href.includes(harnessSheet))
  }, HARNESS_SHEET)

  // There is at least one, and it is not the harness shim.
  expect(guards.length).toBeGreaterThan(0)

  // It actually stills motion rather than merely mentioning the media feature.
  const stills = guards.some((g) => /animation-duration|animation:/.test(g.text))
  expect(stills).toBe(true)
})

/*
  Kept deliberately, and named for what it is. The emulation being on is a
  precondition for the suite, not a property of the design system, so it is
  asserted separately instead of standing in for one.
*/
test('reduced-motion: the suite emulates the preference (harness precondition)', async ({ page }, testInfo) => {
  await openCase(page, testInfo, 'button')
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  expect(reduced).toBe(true)
})
