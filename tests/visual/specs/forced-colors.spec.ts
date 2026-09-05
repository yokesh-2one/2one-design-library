import { test, expect } from '@playwright/test'
import { openCase, FORCED_COLORS_CASES, shotTarget } from '../support/harness'

/*
  A4 · Forced colors (Windows High Contrast). Under an emulated forced palette the
  browser replaces the theme's colours; borders, fills and state cues must still be
  visible (this is where colour-only signals and transparent surfaces disappear).
  Run once (desktop-light) over a curated subset — forced-colors is OS-level, not
  per-theme or per-width.
*/
test.use({ forcedColors: 'active' })

for (const caseId of FORCED_COLORS_CASES) {
  test(`forced-colors: ${caseId}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-light', 'forced-colors sweep runs once')
    await openCase(page, testInfo, caseId)
    await expect(await shotTarget(page)).toHaveScreenshot(`${caseId}.png`)
  })
}
