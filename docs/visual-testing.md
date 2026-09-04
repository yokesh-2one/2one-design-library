# Visual + accessibility testing

Rendered tests that catch **unintended visual changes** and **accessibility
regressions** the token-level checks (`npm run a11y`) cannot see — because they
run a real browser against the real components.

- **Runner:** [Playwright](https://playwright.dev) (Chromium).
- **A11y engine:** [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm).
- **Where:** everything lives under `tests/visual/`. It is **test-only** — not in
  `src`, not in the published `files`, not in the library bundle. Testing
  dependencies are `devDependencies`, so the production bundle does not grow.
- **Not** the frozen `dev/` showcase. Tests render components in a dedicated,
  isolated harness so a showcase edit can never break a baseline and vice-versa.

## What runs

| Suite | File | Asserts |
| --- | --- | --- |
| Visual regression | `tests/visual/screenshots.spec.ts` | Each case matches its committed baseline, per viewport × theme. |
| Rendered a11y | `tests/visual/a11y.spec.ts` | axe (zero serious/critical), keyboard nav + visible focus, Dialog focus trap/restore, 200% zoom reflow, reduced-motion, mobile critical-control visibility. |

Every case is tested in **light + dark** across **mobile (375)**, **laptop (1280)**
and **large desktop (1920)** — six Playwright projects. One screenshot test →
six baselines.

### Coverage

Every component (55 UI + 4 2one-only) plus key compositions (AppShell, a data
table, a video-meeting screen) — 62 cases, each captured across 3 viewports × 2
themes for **372 screenshot baselines**, with axe run on every case × project.
Overlay components (dialog, sheet, drawer, popover, tooltip, hover-card,
dropdown, alert-dialog) render in their open state so the surface that matters is
what's pinned.

Two **serious** accessibility bugs in shipped components were found by building
this coverage and are fixed here: `Table` and `ScrollArea` both had scroll
regions that keyboard users couldn't reach (`scrollable-region-focusable`). Each
is now guarded by its case.

## Commands

```bash
npm run verify:visual        # full suite (visual + a11y) — the CI entry point
npm run test:visual          # screenshots only
npm run test:a11y            # rendered a11y only
npm run test:visual:update   # re-record baselines after an INTENTIONAL change
npm run test:report          # open the last HTML report (diffs, traces)
```

`verify:visual` is deliberately **not** part of `npm run verify`: it needs a browser
download and runs in minutes, while `verify` must stay fast. The two gates are
separate on purpose.

## Reviewing and approving a change

1. A PR changes some pixels → the **Visual + a11y** check fails.
2. Open the failing run's **`playwright-report`** artifact (or run
   `npm run test:report` locally). Each failure shows **expected / actual / diff**.
3. **Unintended?** Fix the code. **Intended?** Approve it by re-recording the
   baseline:

   ```bash
   npm run test:visual:update
   ```

   Commit the changed PNGs under `tests/visual/__screenshots__/`. The diff of those
   binaries in the PR is the reviewer's record of what was signed off.

## Baselines are OS-specific (important)

Font rendering differs across operating systems, so a baseline is only valid on the
OS that produced it. Playwright encodes this: every baseline filename ends in the
platform, e.g. `meeting-desktop-dark-win32.png` vs `…-linux.png`. A single
cross-OS baseline is **not** attempted — it would flake forever.

**CI runs on Linux and needs `-linux` baselines.** Generate them once:

- **Preferred — in CI:** Actions → *Visual + a11y* → **Run workflow** with
  `update = true`. Download the **`updated-baselines`** artifact and commit its
  contents under `tests/visual/__screenshots__/`.
- **Locally with Docker** (matches CI byte-for-byte):

  ```bash
  docker run --rm -v "$PWD":/work -w /work -it mcr.microsoft.com/playwright:v1.62.1-noble \
    npm ci && npx playwright test --update-snapshots
  ```

Developers on Windows/macOS commit their own platform's baselines too; all platforms
coexist in the repo. CI only ever compares against `-linux`.

## Determinism

Screenshots must be identical run-to-run. The harness (`tests/visual/harness/`)
guarantees it:

- **Clock frozen** to `2025-01-15T12:00:00Z`; `Math.random` replaced with a seeded
  PRNG — no current dates, no random values.
- **No network:** fonts (Inter, Satoshi) are self-hosted and bundled; components use
  `MediaPlaceholder`, never remote images.
- **Motion stilled:** animations/transitions forced to `0s` and
  `prefers-reduced-motion` emulated, so nothing is mid-animation under capture.
- **Ready signal:** the page sets `data-ready="1"` only after `fonts.ready` + two
  painted frames; tests wait for it before shooting.

Tolerance is tight on purpose: a small per-pixel colour threshold (AA noise) plus a
40-pixel absolute budget. A percentage ratio was rejected — 1% of a 1280×800 view is
~10k pixels, enough to hide a whole label change.

## Adding a case

1. Add a deterministic render to `tests/visual/harness/fixtures/components.tsx`
   (or a composition in `cases.tsx`) under a new id. Compose from real DLS
   components; use fixed data and label every control.
2. Add the id to `COMPONENT_IDS` (or `COMPOSITION_IDS`) in
   `tests/visual/support/harness.ts`. That is the single source of truth both
   specs iterate; `cases.tsx` checks its registry against it, so the two cannot
   drift.
3. Run `npm run test:visual:update` to record baselines, review them, and commit.
   Regenerate the `-linux` set via the CI update run (above) before it can gate.
