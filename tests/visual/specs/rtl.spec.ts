import { test, expect } from '@playwright/test'
import { openCase, RTL_CASES, shotTarget } from '../support/harness'

/*
  A3 · RTL. A curated subset of direction-sensitive cases rendered under dir="rtl",
  where chrome, tables, nav and grouped controls most often break. Run at laptop
  width in both themes (RTL bugs are direction, not viewport — one width is enough).
*/
for (const caseId of RTL_CASES) {
  test(`rtl: ${caseId}`, async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('laptop-'), 'RTL sweep runs at laptop width')
    await openCase(page, testInfo, caseId, { rtl: '1' })
    await expect(await shotTarget(page)).toHaveScreenshot(`${caseId}.png`)
  })
}
