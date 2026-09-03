import type { Page, TestInfo } from '@playwright/test'

export function themeOf(testInfo: TestInfo): 'light' | 'dark' {
  const t = (testInfo.project.metadata as { theme?: string }).theme
  return t === 'dark' ? 'dark' : 'light'
}

/** Navigate to a harness case in the project's theme and wait for a stable frame. */
export async function openCase(
  page: Page,
  testInfo: TestInfo,
  caseId: string,
  extra: Record<string, string> = {},
): Promise<void> {
  const query = new URLSearchParams({ case: caseId, theme: themeOf(testInfo), ...extra })
  await page.goto(`/?${query.toString()}`)
  // main.tsx sets this only after fonts.ready + two painted frames.
  await page.waitForSelector('html[data-ready="1"]', { timeout: 15_000 })
}

/** The PoC case set. Expands to the full library after sign-off. */
export const POC_CASES = ['button', 'card', 'app-shell', 'meeting'] as const
