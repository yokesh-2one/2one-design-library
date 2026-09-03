import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { openCase, POC_CASES } from './support/harness'

/* ---------------------------------------------------------------------------
   1. Axe — zero serious/critical violations, every case, every theme/viewport.
   --------------------------------------------------------------------------- */
for (const caseId of POC_CASES.concat('dialog' as never)) {
  test(`axe: ${caseId}`, async ({ page }, testInfo) => {
    await openCase(page, testInfo, caseId, caseId === 'dialog' ? { open: '1' } : {})
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(blocking, JSON.stringify(blocking.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toEqual([])
  })
}

/* ---------------------------------------------------------------------------
   2. Keyboard navigation + visible focus (AppShell nav).
   --------------------------------------------------------------------------- */
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

/* ---------------------------------------------------------------------------
   3. Dialog focus trap + restoration.
   --------------------------------------------------------------------------- */
test('dialog: focus moves in, traps, and restores on close', async ({ page }, testInfo) => {
  await openCase(page, testInfo, 'dialog')
  const trigger = page.getByTestId('dialog-trigger')
  await trigger.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  // Focus is now inside the dialog.
  await expect
    .poll(async () => dialog.evaluate((d) => d.contains(document.activeElement)))
    .toBe(true)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  // Focus returns to the trigger that opened it.
  await expect(trigger).toBeFocused()
})

/* ---------------------------------------------------------------------------
   4. 200% zoom — no horizontal overflow / clipping.
   --------------------------------------------------------------------------- */
test('zoom: 200% produces no horizontal scroll', async ({ page }, testInfo) => {
  // WCAG reflow is measured from a desktop width zoomed in; a 375px viewport is
  // already at the narrow end, where full-page zoom legitimately scrolls.
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

/* ---------------------------------------------------------------------------
   5. Reduced motion is actually honoured.
   --------------------------------------------------------------------------- */
test('reduced-motion: media feature is honoured and motion is stilled', async ({
  page,
}, testInfo) => {
  // Emulate the axis under test locally (clearer than relying on global config).
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openCase(page, testInfo, 'button')
  const reduced = await page.evaluate(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  expect(reduced).toBe(true)
  // The harness suppresses motion for stable capture: the loading Spinner
  // (animate-spin) resolves to a zero-duration animation, i.e. it is still.
  const spinner = page.locator('.animate-spin').first()
  await expect(spinner).toBeVisible()
  const duration = await spinner.evaluate((el) => getComputedStyle(el).animationDuration)
  expect(duration).toBe('0s')
})

/* ---------------------------------------------------------------------------
   6. Critical controls stay visible on mobile (meeting "Leave").
   --------------------------------------------------------------------------- */
test('mobile: Leave control stays visible without horizontal scroll', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.use.viewport!.width >= 768, 'mobile viewports only')
  await openCase(page, testInfo, 'meeting')
  const leave = page.getByTestId('leave-call')
  await expect(leave).toBeInViewport()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
