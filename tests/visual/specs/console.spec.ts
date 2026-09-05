import { test, expect } from '@playwright/test'
import { openCase, ALL_CASES } from '../support/harness'

/*
  B9 · Every case renders clean — no console errors, no uncaught exceptions, and no
  network beyond the harness origin (the determinism guarantee: fonts and assets are
  bundled, nothing is fetched). Cheap, high-signal, and independent of pixels. Run at
  one desktop + one mobile project (JS behaviour is theme-independent; responsive DOM
  can differ by width).
*/
for (const caseId of ALL_CASES) {
  test(`clean render: ${caseId}`, async ({ page }, testInfo) => {
    test.skip(
      !['laptop-light', 'mobile-light'].includes(testInfo.project.name),
      'console/network behaviour is theme-independent',
    )

    const errors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    page.on('pageerror', (e) => errors.push(`uncaught: ${e.message}`))

    const offOrigin: string[] = []
    page.on('request', (r) => {
      const url = r.url()
      if (!url.startsWith('http://localhost:4188') && !url.startsWith('data:') && !url.startsWith('blob:')) {
        offOrigin.push(url)
      }
    })

    await openCase(page, testInfo, caseId)
    await page.waitForTimeout(150)

    expect(errors, `console errors in "${caseId}":\n${errors.join('\n')}`).toEqual([])
    expect(offOrigin, `"${caseId}" made off-origin requests (breaks determinism):\n${offOrigin.join('\n')}`).toEqual([])
  })
}
