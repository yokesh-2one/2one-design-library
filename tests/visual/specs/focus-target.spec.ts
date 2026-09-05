import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/*
  B10 · Focus and touch-target coverage across interactive controls (the earlier a11y
  specs only checked AppShell). Both are deterministic and pixel-independent.
*/

const PRIMARY =
  '[data-harness-content] :is(button,select,[role="combobox"],[role="checkbox"],[role="switch"],[role="tab"],[role="radio"],[role="slider"],input,textarea,a)'

// Focus-visible: the focused control must show an outline or ring.
const FOCUS_CASES = [
  'button', 'checkbox', 'switch', 'tabs', 'toggle', 'toggle-group', 'select',
  'input', 'textarea', 'radio-group', 'slider', 'native-select',
]

for (const caseId of FOCUS_CASES) {
  test(`focus-visible: ${caseId}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'laptop-light', 'focus indicator is theme-independent')
    await openCase(page, testInfo, caseId)
    const control = page.locator(PRIMARY).first()
    await control.focus()
    const visible = await control.evaluate((el) => {
      const s = getComputedStyle(el)
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0
      const ring = s.boxShadow !== 'none' && s.boxShadow !== ''
      return outline || ring
    })
    expect(visible, `${caseId}: focused control shows no outline or ring`).toBe(true)
  })
}

// Touch-target size: genuine tap targets should be at least 24×24 (WCAG 2.5.8).
const TOUCH_CASES = ['button', 'bottom-nav-item', 'pagination', 'toggle-group']

for (const caseId of TOUCH_CASES) {
  test(`target-size: ${caseId}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-light', 'target size matters on touch (mobile)')
    await openCase(page, testInfo, caseId)
    const controls = page.locator('[data-harness-content] :is(button,a[href])')
    const n = await controls.count()
    const small: string[] = []
    for (let i = 0; i < n; i++) {
      const box = await controls.nth(i).boundingBox()
      if (box && (box.width < 24 || box.height < 24)) {
        small.push(`${Math.round(box.width)}×${Math.round(box.height)}`)
      }
    }
    expect(small, `${caseId}: tap targets below 24×24: ${small.join(', ')}`).toEqual([])
  })
}
