import { test, expect } from '@playwright/test'
import { openCase, SCREENSHOT_CASES, shotTarget } from './support/harness'

/*
  Visual-regression snapshots. Each case is captured per project (viewport × theme),
  so one test yields six baselines. A pixel change beyond the configured tolerance
  fails CI and produces a diff image in the HTML report + trace.
*/

for (const caseId of SCREENSHOT_CASES) {
  test(`snapshot: ${caseId}`, async ({ page }, testInfo) => {
    await openCase(page, testInfo, caseId)
    // A2: fill → full-page; center → clipped to the component (portaled-open overlays
    // fall back to full-page). See shotTarget.
    await expect(await shotTarget(page)).toHaveScreenshot(`${caseId}.png`)
  })
}
