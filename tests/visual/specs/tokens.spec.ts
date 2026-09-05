import { test, expect } from '@playwright/test'
import { openCase } from '../support/harness'

/*
  B8 · Token invariants. A screenshot can pass even if a colour was hardcoded to the
  right value; this proves the component's rendered colour actually RESOLVES to the
  design token — catching drift where a component stops tracking the token. Run in both
  themes, so it also proves the light/dark token mapping is wired.
*/
for (const project of ['laptop-light', 'laptop-dark']) {
  test(`token invariants: button colours resolve to tokens (${project})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== project, 'per-theme invariant')
    await openCase(page, testInfo, 'button')

    const res = await page.evaluate(() => {
      const probe = (name: string) => {
        const d = document.createElement('div')
        d.style.color = `var(${name})`
        document.body.appendChild(d)
        const c = getComputedStyle(d).color
        d.remove()
        return c
      }
      const byText = (t: string) =>
        [...document.querySelectorAll('button')].find((b) => (b.textContent || '').includes(t)) || null
      const primary = byText('Primary action')
      const destructive = byText('Delete')
      return {
        primaryBg: primary && getComputedStyle(primary).backgroundColor,
        primaryToken: probe('--primary'),
        destructiveBg: destructive && getComputedStyle(destructive).backgroundColor,
        destructiveToken: probe('--destructive'),
      }
    })

    expect(res.primaryBg, 'primary button background must resolve to --primary').toBe(res.primaryToken)
    expect(res.destructiveBg, 'destructive button background must resolve to --destructive').toBe(
      res.destructiveToken,
    )
  })
}
