import { test, expect } from '@playwright/test'
import { openCase, POC_CASES } from './support/harness'

/*
  Visual-regression snapshots. Each case is captured per project (viewport × theme),
  so one test yields six baselines. A pixel change beyond the configured tolerance
  fails CI and produces a diff image in the HTML report + trace.
*/

for (const caseId of POC_CASES) {
  test(`snapshot: ${caseId}`, async ({ page }, testInfo) => {
    await openCase(page, testInfo, caseId)
    await expect(page).toHaveScreenshot(`${caseId}.png`)
  })
}

// Dialog is captured in its OPEN state (deterministic via ?open=1) so the overlay,
// focus ring, and content are what the baseline pins.
test('snapshot: dialog-open', async ({ page }, testInfo) => {
  await openCase(page, testInfo, 'dialog', { open: '1' })
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page).toHaveScreenshot('dialog-open.png')
})
