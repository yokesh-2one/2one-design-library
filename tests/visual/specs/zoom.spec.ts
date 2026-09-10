import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/* 200% zoom must not introduce horizontal scroll / clipping (WCAG reflow). */
test('zoom: 200% produces no horizontal scroll', async ({ page }, testInfo) => {
  // Reflow is measured from a desktop width zoomed in; a 375px viewport is already
  // at the narrow end, where full-page zoom legitimately scrolls.
  test.skip(testInfo.project.use.viewport!.width < 768, 'reflow measured from desktop widths')
  await openCase(page, testInfo, 'app-shell')
  await page.evaluate(() => {
    // CSS zoom is the closest scriptable analogue to browser page zoom in Chromium.
    ;(document.documentElement.style as CSSStyleDeclaration & { zoom: string }).zoom = '2'
  })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
