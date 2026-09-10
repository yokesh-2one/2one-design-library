import { test, expect } from '@playwright/test'
import { openCase, ARIA_CASES } from '../support/harness'

/*
  B7 · Accessibility-tree snapshots. Catches SEMANTIC regressions a pixel diff can't
  see — a heading that became a <div>, a dropped aria-label, a role change, a lost
  landmark. The tree is derived from the DOM (roles, names, structure), so it is
  independent of theme and OS; we snapshot once per case at laptop-light. The
  committed .aria.yml files are byte-identical across win32/linux.
*/
for (const caseId of ARIA_CASES) {
  test(`aria: ${caseId}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'laptop-light', 'aria tree is theme/OS-independent — snapshot once')
    await openCase(page, testInfo, caseId)
    // Snapshot <body> so portaled-open overlays (dialog, menu, tooltip) are included.
    await expect(page.locator('body')).toMatchAriaSnapshot({ name: `${caseId}.aria.yml` })
  })
}
