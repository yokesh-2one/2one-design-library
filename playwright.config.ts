import { defineConfig, devices } from '@playwright/test'

/*
  Visual-regression + rendered-a11y config for the 2one DLS. Test-only: it drives
  the harness under tests/visual/harness (never the frozen dev/ showcase) and is
  excluded from the library build and the production bundle.

  Matrix: three viewport classes × two themes = six projects. Playwright suffixes
  each screenshot baseline with the project name AND the OS platform, so baselines
  are explicit per {viewport, theme, os}. Baselines committed from Windows carry a
  `-win32` suffix; CI (ubuntu) generates and commits its own `-linux` baselines —
  see docs/visual-testing.md. Font rendering differs across OSes, so a single
  cross-OS baseline is deliberately NOT attempted.
*/

const THEMES = ['light', 'dark'] as const

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
} as const

const projects = Object.entries(VIEWPORTS).flatMap(([vp, viewport]) =>
  THEMES.map((theme) => ({
    name: `${vp}-${theme}`,
    use: {
      ...devices['Desktop Chrome'],
      viewport,
      // Requirement #4/#6: reduced motion on, so nothing animates under capture.
      reducedMotion: 'reduce' as const,
      // Read by tests to build the harness URL (?theme=...).
      colorScheme: theme === 'dark' ? ('dark' as const) : ('light' as const),
    },
    metadata: { theme },
  })),
)

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Browser + axe runs have rare transient flakes under heavy parallelism; a
  // retry in CI absorbs those without masking a real, reproducible failure.
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  expect: {
    toHaveScreenshot: {
      // `threshold` is the per-pixel colour sensitivity (YIQ) that absorbs sub-pixel
      // AA noise; `maxDiffPixels` is a tiny absolute budget for how many pixels may
      // exceed it. A percentage ratio (e.g. 1%) was tried first and REJECTED: on a
      // 1280×800 view it tolerated ~10k differing pixels, hiding a whole button-label
      // change. Same-OS reruns diff by exactly 0, so this stays tight on purpose.
      threshold: 0.2,
      maxDiffPixels: 40,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'http://localhost:4188',
    trace: 'on-first-retry',
  },
  projects,
  webServer: {
    command: 'npx vite --config tests/visual/vite.config.ts',
    url: 'http://localhost:4188',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120_000,
  },
})
