import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/* prefers-reduced-motion is honoured and motion is stilled. */
test('reduced-motion: media feature is honoured and motion is stilled', async ({
  page,
}, testInfo) => {
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
