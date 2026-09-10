import { test, expect } from '@playwright/test'
import { openCase, STATE_SHOTS } from '../support/harness'

/*
  A1 · Interaction-state matrix. For each interactive case, capture the states a
  resting screenshot misses — hover and focus — clipped to the component, so a
  regression in a :hover surface or a focus-visible ring is caught deterministically
  (animations are disabled). The OPEN state of overlays is already covered by the
  gallery's defaultOpen cases; this fills the hover/focus gap.
*/

// The primary control inside the component — what a user hovers or focuses.
const PRIMARY =
  '[data-harness-content] :is(button,select,[role="combobox"],[role="checkbox"],[role="switch"],[role="tab"],[role="radio"],[role="slider"],input,textarea,a)'

for (const [caseId, states] of Object.entries(STATE_SHOTS)) {
  for (const state of states) {
    test(`state ${state}: ${caseId}`, async ({ page }, testInfo) => {
      await openCase(page, testInfo, caseId)
      const control = page.locator(PRIMARY).first()
      await expect(control).toBeVisible()
      const content = page.locator('[data-harness-content] > *').first()

      if (state === 'hover') await control.hover()
      else await control.focus()

      await expect(content).toHaveScreenshot(`${caseId}-${state}.png`)
    })
  }
}
