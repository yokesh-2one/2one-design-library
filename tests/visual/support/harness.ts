import type { Page, TestInfo } from '@playwright/test'

export function themeOf(testInfo: TestInfo): 'light' | 'dark' {
  const t = (testInfo.project.metadata as { theme?: string }).theme
  return t === 'dark' ? 'dark' : 'light'
}

/*
  Decide what to screenshot (A2). 'fill' cases (patterns/pages) are shot full-page.
  'center' cases are clipped to the component for a tight baseline — UNLESS the
  component portals its visible content to <body> (an overlay rendered open, so the
  in-place wrapper is empty), in which case we fall back to full-page so the portal
  is captured. Returns a Playwright screenshot target (Page or Locator).
*/
export async function shotTarget(page: Page) {
  const layout = await page.locator('html').getAttribute('data-layout')
  if (layout === 'fill') return page
  // Overlays rendered open (dialog, alert-dialog, sheet, drawer, and popper overlays
  // like tooltip/menu/popover) portal their content to <body>, so the in-place wrapper
  // has no child — shoot full-page so the portal is captured.
  const portals = await page
    .locator('[role="dialog"],[role="alertdialog"],[data-radix-popper-content-wrapper]')
    .count()
  if (portals > 0) return page
  // The wrapper is display:contents (no box), so clip to its component child. Guard the
  // empty case first: boundingBox() on a missing locator auto-waits to the test timeout.
  const content = page.locator('[data-harness-content] > *').first()
  if ((await content.count()) === 0) return page
  const box = await content.boundingBox().catch(() => null)
  if (!box || box.width < 2 || box.height < 2) return page
  return content
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
export const COMPOSITION_IDS = ['button', 'card', 'table', 'dialog', 'app-shell', 'meeting', 'marketing-site'] as const

/** Full-page blocks (auth, dashboard, marketing). */
export const BLOCK_IDS = ['login', 'signup', 'dashboard', 'marketing'] as const

/** The required predictable states (req #6). */
export const STATE_IDS = ['state-disabled', 'state-loading', 'state-empty', 'state-error', 'state-success'] as const

/** Every case gets an axe pass. */
export const ALL_CASES = [...COMPOSITION_IDS, ...COMPONENT_IDS, ...BLOCK_IDS, ...STATE_IDS] as const

/*
  Screenshot-only exclusions. Empty now: `dashboard` used to be skipped because its
  recharts chart animates via JS (which `animations: 'disabled'` can't freeze), but
  the chart now honours prefers-reduced-motion (isAnimationActive off under the
  reduced-motion the projects emulate), so it renders deterministically and IS shot.
*/
export const SCREENSHOT_EXCLUDE = new Set<string>([])

/** Cases that get a screenshot baseline. */
export const SCREENSHOT_CASES = ALL_CASES.filter((id) => !SCREENSHOT_EXCLUDE.has(id))

/* ---------------------------------------------------------------------------
   A1 · Interaction-state matrix. The resting screenshot misses hover and focus,
   where a hover surface or a focus-visible ring silently regresses. We capture
   those per interactive control. (The OPEN state of overlays — menus, dialogs,
   tooltips — is already covered: the component gallery renders those cases with
   `defaultOpen`, so their base snapshot IS the open state.)
   --------------------------------------------------------------------------- */
export const STATE_SHOTS: Record<string, ReadonlyArray<'hover' | 'focus'>> = {
  button: ['hover', 'focus'],
  checkbox: ['hover', 'focus'],
  switch: ['hover', 'focus'],
  toggle: ['hover', 'focus'],
  'toggle-group': ['hover', 'focus'],
  select: ['hover', 'focus'],
  input: ['focus'],
  textarea: ['focus'],
  'native-select': ['focus'],
  'radio-group': ['focus'],
  tabs: ['focus'],
  slider: ['focus'],
}

/* A3 · RTL — a curated subset of direction-sensitive cases (chrome, tables, nav,
   grouped controls, forms). Run under dir="rtl". */
export const RTL_CASES = [
  'app-shell', 'marketing-site', 'meeting', 'table', 'tabs', 'breadcrumb',
  'pagination', 'navigation-menu', 'button-group', 'input-group', 'toolbar',
  'card', 'form', 'login',
] as const

/* A4 · Forced colors (Windows High Contrast) — components whose borders, fills and
   state cues must survive the forced palette. */
export const FORCED_COLORS_CASES = [
  'button', 'input', 'checkbox', 'switch', 'badge', 'alert', 'card', 'table',
  'tabs', 'dialog-open', 'select', 'field', 'state-error',
] as const

/* A5 · No page overflow applies to the RESPONSIVE surfaces — the patterns, pages and
   blocks that must reflow to any width. The isolated component demos are intentionally
   fixed-width showcases (e.g. a w-96 card, or a wide Table that scrolls inside its own
   overflow-x container) and are out of scope for a PAGE-overflow check. */
export const OVERFLOW_CASES = ['app-shell', 'marketing-site', 'meeting', ...BLOCK_IDS] as const
