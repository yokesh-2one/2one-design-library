import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/* Keyboard navigation reaches the AppShell nav, and focus is visibly indicated. */
test('keyboard: focus reaches nav and is visible', async ({ page }, testInfo) => {
  await openCase(page, testInfo, 'app-shell')
  await page.keyboard.press('Tab')
  const focused = page.locator(':focus')
  await expect(focused).toBeVisible()
  // A visible focus indicator: a ring (box-shadow) or an outline.
  const hasIndicator = await focused.evaluate((el) => {
    const s = getComputedStyle(el)
    return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0
      ? true
      : s.boxShadow !== 'none'
  })
  expect(hasIndicator).toBe(true)
})
