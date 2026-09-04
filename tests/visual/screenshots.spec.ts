import { test, expect } from '@playwright/test'
import { openCase, ALL_CASES } from './support/harness'

/*
  Visual-regression snapshots. Each case is captured per project (viewport × theme),
  so one test yields six baselines. A pixel change beyond the configured tolerance
  fails CI and produces a diff image in the HTML report + trace.
*/

for (const caseId of ALL_CASES) {
  test(`snapshot: ${caseId}`, async ({ page }, testInfo) => {
    await openCase(page, testInfo, caseId)
    await expect(page).toHaveScreenshot(`${caseId}.png`)
  })
}
