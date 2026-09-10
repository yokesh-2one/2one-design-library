import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { openCase, ALL_CASES } from '../support/harness'

/*
  Axe — zero serious/critical violations, every case, every theme × viewport.
  Advisory (moderate/minor) violations are not failed here; serious/critical are.
*/
for (const caseId of ALL_CASES) {
  test(`axe: ${caseId}`, async ({ page }, testInfo) => {
    await openCase(page, testInfo, caseId)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(
      blocking,
      JSON.stringify(blocking.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2),
    ).toEqual([])
  })
}
