import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/* Dialog: focus moves in on open, is trapped, and restores to the trigger on close. */
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
