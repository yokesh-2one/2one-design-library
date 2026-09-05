import { createRoot } from 'react-dom/client'
import './theme.css'
import { ThemeProvider } from '../../../src/theme-provider'
import { CASES } from './cases'

/* ---------------------------------------------------------------------------
   Deterministic environment. Requirement #6: no current dates, no random
   values, no network. We install these BEFORE React renders so any component
   that reads Date/Math.random at mount sees the frozen values.
   --------------------------------------------------------------------------- */

// Freeze the clock to a fixed instant.
const FIXED_NOW = new Date('2025-01-15T12:00:00.000Z').getTime()
const RealDate = Date
class FrozenDate extends RealDate {
  constructor(...args: ConstructorParameters<typeof Date>) {
    if (args.length === 0) super(FIXED_NOW)
    else super(...(args as []))
  }
  static now() {
    return FIXED_NOW
  }
}
globalThis.Date = FrozenDate as DateConstructor

// Deterministic PRNG (mulberry32) in place of Math.random.
let seed = 0x32306e65 // "2one"
Math.random = () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Params: ?case=<id>&theme=<light|dark>&rtl=1  (viewport is set by the Playwright project)
const params = new URLSearchParams(location.search)
const caseId = params.get('case') ?? 'index'
const theme = params.get('theme') === 'dark' ? 'dark' : 'light'

// RTL axis: components must survive dir="rtl". Set before render so layout is RTL from
// the first paint.
if (params.get('rtl') === '1') document.documentElement.setAttribute('dir', 'rtl')

const entry = CASES[caseId]
const content = entry ? (
  entry.render(params)
) : (
  <ul style={{ fontFamily: 'system-ui', padding: 24 }}>
    {Object.keys(CASES).map((id) => (
      <li key={id}>
        <a href={`?case=${id}`}>{id}</a>
      </li>
    ))}
  </ul>
)

const fill = entry?.layout === 'fill'
// Tests read this to decide clipping: 'fill' cases are shot full-page; 'center' cases
// are clipped to [data-harness-content] for a tight per-component baseline (A2).
document.documentElement.dataset.layout = fill ? 'fill' : 'center'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider forcedTheme={theme}>
    <div
      data-harness-root
      className={
        fill
          ? 'h-dvh w-full bg-background text-foreground'
          : 'flex min-h-dvh w-full items-center justify-center bg-background p-8 text-foreground'
      }
    >
      {/* display:contents — the wrapper is a clip anchor for A2 but generates no box,
          so component layout is identical to rendering content directly. */}
      {fill ? content : <div data-harness-content style={{ display: 'contents' }}>{content}</div>}
    </div>
  </ThemeProvider>,
)

/* Signal readiness only once fonts are loaded and two frames have painted, so
   Playwright never screenshots a half-laid-out or FOUT frame. Tests wait for
   [data-ready="1"] on <html>. */
async function signalReady() {
  try {
    await (document as Document).fonts?.ready
  } catch {
    /* fonts API absent — proceed */
  }
  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.documentElement.setAttribute('data-ready', '1')),
  )
}
void signalReady()
