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

/*
  Canonical case list — the single source of truth the specs iterate. Kept as
  plain strings (no imports) so the Playwright/Node runtime can read it without
  resolving the harness's `@` alias or JSX. cases.tsx imports this same list and
  asserts every id has a render, so the two can't drift.
*/
export const COMPONENT_IDS = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge',
  'breadcrumb', 'button-group', 'calendar', 'carousel', 'chart', 'checkbox',
  'collapsible', 'command', 'context-menu', 'dialog-open', 'drawer',
  'dropdown-menu', 'empty', 'field', 'form', 'hover-card', 'input', 'input-group',
  'input-otp', 'item', 'kbd', 'label', 'menubar', 'native-select',
  'navigation-menu', 'pagination', 'popover', 'progress', 'radio-group',
  'resizable', 'scroll-area', 'select', 'separator', 'sheet', 'sidebar',
  'skeleton', 'slider', 'sonner', 'spinner', 'switch', 'tabs', 'textarea',
  'toggle', 'toggle-group', 'toolbar', 'tooltip',
  'app-bar', 'bottom-nav-item', 'logo', 'media-placeholder',
] as const

/** Dedicated compositions defined directly in cases.tsx. */
export const COMPOSITION_IDS = ['button', 'card', 'table', 'dialog', 'app-shell', 'meeting'] as const

/** Every case that gets a screenshot + axe pass. */
export const ALL_CASES = [...COMPOSITION_IDS, ...COMPONENT_IDS] as const
