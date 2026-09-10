import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/* Critical controls stay visible on mobile (the meeting "Leave" action). */
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
