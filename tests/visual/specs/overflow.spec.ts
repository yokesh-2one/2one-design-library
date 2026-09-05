import { test, expect } from '@playwright/test'
import { openCase, OVERFLOW_CASES } from '../support/harness'

/*
  A5 · No horizontal PAGE overflow on the responsive surfaces (patterns, pages,
  blocks) × every viewport. An inner region may scroll by design (a wide Table's
  overflow-x container), but the page itself must never scroll sideways — that's a
  broken layout. Cheap, deterministic, and it catches breaks a resting screenshot
  can pass (a diff can be "expected"). Isolated fixed-width component demos are out
  of scope — see OVERFLOW_CASES.
*/
for (const caseId of OVERFLOW_CASES) {
  test(`no page overflow: ${caseId}`, async ({ page }, testInfo) => {
    await openCase(page, testInfo, caseId)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `${caseId} overflows the viewport by ${overflow}px`).toBeLessThanOrEqual(1)
  })
}
