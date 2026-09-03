/*
  check-usage — audits generated or hand-written UI code against a design
  system's rules. ENGINE: the rule MECHANISMS live here; the values they test
  against (wordmark, icon library, own ramps, spacing base) come from
  dls.config.json, so the same checks work for any payload.

  The other checks in this repo verify the SYSTEM (tokens valid, contrast passes,
  generated files in sync). This one verifies OUTPUT: code someone — or some
  model — wrote while using the system. That is the gap the manifest cannot
  close on its own, because a document can only prevent mistakes an agent chose
  to read.

  Every rule here already exists in prose in docs/building-with-the-dls.md or
  brand/logo/manifest.json. This turns them from advisory into checkable.

  Usage:
    node scripts/check-usage.mjs <file|dir> [...]     # defaults to the payload's blocks
    node scripts/check-usage.mjs --json <file>        # machine-readable
    node scripts/check-usage.mjs --warnings <file>    # warnings fail too
    node scripts/check-usage.mjs --draft <file>       # + a review checklist of the advisory "must" rules a static run can't judge

  Exit code: 1 if any error-severity finding (or any finding with --warnings).
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { config as cfg } from './lib/config.mjs'

const root = cfg.root
const args = process.argv.slice(2)
const asJson = args.includes('--json')
const strict = args.includes('--warnings')
const draft = args.includes('--draft')
const targets = args.filter((a) => !a.startsWith('--'))

/*
  The knowledge graph is the authority on which tokens exist. Without it this
  file can only catch tokens from OTHER systems (bg-blue-500) — it cannot catch
  an invented 2one-shaped one. `bg-muted-strong` and `text-surface-elevated`
  look exactly like this system's vocabulary, are entirely fictional, and passed
  every check until graph.json was consulted. That is the failure mode a model
  actually has: not reaching for Bootstrap, but confidently inventing a token
  that sounds like yours.
*/
const graph = (() => {
  for (const p of [join(root, cfg.rel('out.graph')), join(root, '..', 'graph.json')]) {
    try { return JSON.parse(readFileSync(p, 'utf8')) } catch { /* try next */ }
  }
  return null
})()

// The specifier a consumer imports from. Payload-declared; without it the
// unknown-import rule has no idea which imports are the system's own.
const PKG_SPECIFIER = cfg.packageName ?? null

/*
  The package's public API, for the unknown-import rule. Read from the manifest
  because the source tree does not ship to a consumer — see build-manifest.
*/
const knownExports = (() => {
  for (const p of [join(root, cfg.rel('out.manifest')), join(root, '..', 'manifest.json')]) {
    try {
      const list = JSON.parse(readFileSync(p, 'utf8'))?.index?.components?.exports
      if (Array.isArray(list) && list.length) return new Set(list)
    } catch { /* try next */ }
  }
  return null // absent → the rule stays silent rather than guessing
})()

// The payload's own ramp names, read from its generated tokens. Needed because
// Tailwind's stock palette list overlaps with plausible ramp names — a payload
// whose primary ramp is called `slate` would have had its entire palette
// reported as a foreign hue by a hardcoded list.
const ownRamps = (() => {
  try {
    const c = JSON.parse(readFileSync(join(cfg.path('out.tokens'), 'colors.json'), 'utf8'))
    return new Set(Object.keys(c.ramps ?? {}))
  } catch { return new Set() }
})()

/*
  The names a validation colour actually appears under in code.

  `rules.validationHues` names the RAMPS (danger, success). Components reach for
  the SEMANTIC alias instead — shadcn calls the danger ramp `destructive` — so a
  rule matching only the ramp names missed `variant="destructive"`, which is the
  overwhelmingly common case and the one that prompted the rule.

  Rather than hardcode that alias, resolve it: any semantic token whose value is
  a colour drawn from a validation ramp is a validation token, whatever it is
  called. A payload that names its ramp `alert` and its token `warn` is covered
  without knowing either name in advance.
*/
const VALIDATION_NAMES = (() => {
  const hues = (cfg.rules.validationHues ?? []).filter(Boolean)
  const names = new Set(hues)
  try {
    const c = JSON.parse(readFileSync(join(cfg.path('out.tokens'), 'colors.json'), 'utf8'))
    const swatches = new Set(hues.flatMap((h) => Object.values(c.ramps?.[h] ?? {})).map((v) => String(v).toLowerCase()))
    for (const [name, value] of Object.entries(c.semantic ?? {})) {
      if (swatches.has(String(value).toLowerCase())) names.add(name.replace(/-foreground$/, ''))
    }
  } catch { /* tokens unreadable — ramp names alone */ }
  return [...names]
})()

const knownTokens = new Set()
if (graph) {
  for (const n of graph.nodes) {
    if (n.type === 'token-color') knownTokens.add(n.label)          // primary, muted-foreground …
    if (n.type === 'ramp') knownTokens.add(n.label)                  // neutral-250, danger-700 …
    if (n.type === 'token-radius') knownTokens.add(n.label.replace(/^radius-/, ''))
  }
}

// Tailwind literals and utility keywords that share a prefix with colour utilities
// but are not tokens. Without these the rule drowns in false positives.
const NON_TOKEN = new Set([
  'transparent', 'current', 'inherit', 'white', 'black', 'none', 'auto', 'clip', 'ellipsis',
  'left', 'center', 'right', 'justify', 'start', 'end', 'top', 'bottom', 'balance', 'pretty',
  'wrap', 'nowrap', 'solid', 'dashed', 'dotted', 'double', 'hidden', 'collapse', 'separate',
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
  'display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'full', 'md',
])

// Tailwind's stock palettes, minus any the payload has actually adopted as its
// own ramp. Whatever remains is a second palette by definition.
const TAILWIND_HUES = [
  'slate', 'gray', 'zinc', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]
const FOREIGN_HUES = TAILWIND_HUES.filter((h) => !ownRamps.has(h)).join('|')

// Every icon package except the one this payload sanctioned. Listing the
// forbidden ones by hand meant the sanctioned library had to be lucide.
const ICON_PACKAGES = [
  'lucide-react', '@tabler/icons-react', 'react-icons', '@heroicons/react',
  '@fortawesome/react-fontawesome', '@radix-ui/react-icons', '@phosphor-icons/react', 'phosphor-react',
]
const OWN_ICONS = cfg.rules.iconLibrary
const FOREIGN_ICONS = new RegExp(
  `from\\s+['"](${ICON_PACKAGES.filter((p) => p !== OWN_ICONS).map((p) => p.replace(/[/@.]/g, '\\$&')).join('|')})`
)

// The mark this payload protects. Hardcoding "2one" meant the rule was inert
// for every other design system.
const WORDMARK = cfg.rules.wordmark ?? cfg.name
const SPACING_BASE = cfg.rules.spacingBase ?? 4

/*
  ---- the authored rules ----

  Until now this file and rules/ux-rules.json were two disjoint vocabularies.
  The payload authored 32 rules with ids like `no-color-alone` and severities
  like `must`; this file carried 12 unrelated detectors with ids like
  `color-only-state` and severities it chose itself. Nothing connected them, so
  `check-rules` could report "32 UX rules valid" and `check` could report "no
  violations" while 23 of those rules had no mechanism behind them at all. Both
  greens were true and together they said nothing.

  So: the AUTHORED rule is the identity, and a detector here is one
  IMPLEMENTATION of it. Each detector declares `implements`. Severity and
  wording then come from the payload, because how strictly a system holds its
  own rule is the payload's call, not the engine's — and the same detector can
  be an error for one client and a warning for another without a code change.

  Two consequences worth stating:
    - a payload that ships rules but omits one has DECLINED that rule, and its
      detector goes quiet. Silence is now a decision someone made.
    - a payload with no rules file at all behaves exactly as before, so this
      lands without a flag day.
*/
const authored = (() => {
  const p = cfg.rel('rules')
  if (!p) return null
  try {
    const raw = JSON.parse(readFileSync(join(root, p), 'utf8'))
    const list = Array.isArray(raw) ? raw : raw.rules
    return Array.isArray(list) ? new Map(list.map((r) => [r.id, r])) : null
  } catch { return null } // absent → every detector runs at its built-in severity
})()

// `may` is not in this payload's vocabulary but costs nothing to map, and a
// payload that adds it should not have its rule silently dropped to `error`.
const SEVERITY = { must: 'error', forbidden: 'error', should: 'warn', may: 'warn' }

/*
  Blank out comment bodies, preserving every byte offset so reported line
  numbers still point at the real source.

  Any rule that treats the PRESENCE of a string as proof of compliance has to
  do this first. The motion rule stands down when it sees a reduced-motion
  guard — and a file whose comment merely mentioned "prefers-reduced-motion"
  switched it off. The eval case written to prove the rule fires disabled it in
  its own header comment, which is as neat a demonstration of the failure as
  could be arranged.
*/
/*
  A non-colour cue that carries meaning alongside a hue.

  Two rules need this and they must not drift apart. `validation-only` permits
  danger/success for data-trend deltas as well as validation state, in both
  cases only when the hue is PAIRED with a direction arrow, icon or text — so a
  metric card showing −12.4% in danger beside a TrendingDown is conforming, and
  the same card without the icon is not. `no-color-alone` asks the same
  question. One definition, two callers.
*/
const SIGNAL = /aria-invalid|aria-describedby|FieldError|role=["']alert["']|Trending(?:Up|Down)|Arrow(?:Up|Down)|Chevron(?:Up|Down)/

const stripComments = (s) => {
  const blank = (t) => t.replace(/[^\n]/g, ' ')
  return s
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)))
}

/** @type {{id:string,severity:'error'|'warn',test:(ctx:any)=>{line:number,detail:string}[]}[]} */
const RULES = [
  {
    id: 'hardcoded-color',
    implements: 'tokens-only',
    severity: 'error',
    why: 'Hard-coded colour drifts from the tokens and breaks re-theming. Use the semantic utilities (bg-primary, text-muted-foreground, border).',
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        // hex in a className or style, but not inside an SVG path/fill of a brand asset
        [...l.matchAll(/#[0-9a-fA-F]{3,8}\b/g)]
          .filter(() => !/\.svg|viewBox|d="M/.test(l))
          .map((m) => ({ line: i + 1, detail: `hard-coded ${m[0]}` }))
      ),
  },
  {
    id: 'foreign-palette',
    implements: 'grayscale',
    severity: 'error',
    why: `Only this system's own ramps (${[...ownRamps].join(', ') || 'none declared'}) may be used. Any other palette is a second palette by definition.`,
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        [...l.matchAll(new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via)-(?:${FOREIGN_HUES})-\\d{2,3}\\b`, 'g'))].map(
          (m) => ({ line: i + 1, detail: `${m[0]} introduces a hue outside the system` })
        )
      ),
  },
  {
    id: 'invented-token',
    implements: 'tokens-only',
    severity: 'error',
    why: 'This token does not exist in the system. Check graph.json or tokens/colors.json for the real name — a plausible-sounding token silently renders as nothing.',
    test: ({ lines }) => {
      if (!graph) return [] // graph unavailable — stay silent rather than guess
      return lines.flatMap((l, i) =>
        [...l.matchAll(/\b(?:bg|text|border|ring|fill|stroke|outline|divide|placeholder|caret|decoration)-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\b/g)]
          // Tailwind puts modifiers between the prefix and the colour:
          // ring-offset-background, border-l-transparent, divide-y-border.
          // Strip them so the check sees the colour name itself.
          .map((m) => m[1].replace(/^(?:offset-|[btlrxyse]-(?=\D))/, ''))
          .filter((name) => {
            if (knownTokens.has(name) || NON_TOKEN.has(name)) return false
            if (new RegExp(`^(?:${FOREIGN_HUES})(?:-\\d{2,3})?$`).test(name)) return false // its own rule
            if (/^\d/.test(name) || /\[/.test(name)) return false                          // border-2, arbitrary
            if (/^[btlrxyse](?:-\d+)?$/.test(name)) return false                           // border-b, border-t-0
            if (/^gradient-/.test(name)) return false                                      // bg-gradient-to-r
            if (name.length < 3) return false
            // Only names shaped like this system's semantic tokens. A real but
            // unlisted single word would be missed; the alternative is drowning
            // the report in Tailwind's own utility vocabulary, which gets the
            // check switched off entirely.
            return /-/.test(name)
          })
          .map((name) => ({ line: i + 1, detail: `"${name}" is not a token in this system` }))
      )
    },
  },
  /*
    Deliberately narrow: this flags a named import FROM THE PACKAGE that the
    package does not export, and nothing else.

    Composing something the library has no primitive for — a kanban board, a
    wizard, a heatmap — is legitimate and expected work, and the other ten rules
    already hold it to the brand: its colours, tokens, icons, spacing, wordmark
    and container pattern are all checked whether or not the thing itself is
    novel. Flagging invention as such would break the one behaviour this system
    most needs to allow.

    What is never legitimate is `import { DataGrid } from '@2one/design-library'`
    when no DataGrid exists. That is not creativity, it is a build error the
    author has not hit yet — and the likeliest next step is hand-rolling a
    parallel component off-system. Locally defined components and relative
    imports are untouched.
  */
  {
    id: 'unknown-import',
    implements: 'build-from-library',
    severity: 'error',
    why: `Imported from ${PKG_SPECIFIER ?? 'the design system package'}, which does not export it. Compose it from real primitives instead — building it locally is fine, importing something that does not exist is a build error.`,
    test: ({ src }) => {
      if (!knownExports || !PKG_SPECIFIER) return []
      const out = []
      /*
        Blank out comments first. theme-provider.tsx documents its own usage in
        a JSDoc block — `* import { ThemeProvider } from '<pkg>'` — and the
        first version read that example as a real import. Replacing comment
        bodies with spaces rather than deleting them keeps every byte offset
        intact, so reported line numbers still point at the real source.
      */
      const blank = (s) => s.replace(/[^\n]/g, ' ')
      src = src
        .replace(/\/\*[\s\S]*?\*\//g, blank)
        .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)))
      // `import { A, B as C } from '<pkg>'` — value imports only; `import type`
      // is a types question and not this rule's business.
      const re = new RegExp(`import\\s+(?!type\\b)\\{([^}]*)\\}\\s*from\\s*['"]${PKG_SPECIFIER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
      for (const m of src.matchAll(re)) {
        const line = src.slice(0, m.index).split('\n').length
        for (const part of m[1].split(',')) {
          const raw = part.trim()
          if (!raw || raw.startsWith('type ')) continue
          const name = raw.split(/\s+as\s+/)[0].trim()
          if (!name || !/^[A-Za-z_$][\w$]*$/.test(name)) continue
          if (!knownExports.has(name)) out.push({ line, detail: `"${name}" is not exported by the package` })
        }
      }
      return out
    },
  },
  {
    id: 'foreign-icons',
    implements: 'lucide-only',
    severity: 'error',
    why: `${OWN_ICONS} only. A second icon set is one of the most visible "AI-generated" tells.`,
    test: ({ lines }) =>
      lines.flatMap((l, i) => (FOREIGN_ICONS.test(l) ? [{ line: i + 1, detail: l.trim().slice(0, 80) }] : [])),
  },
  {
    id: 'typeset-wordmark',
    implements: 'logo-untouchable',
    severity: 'error',
    why: 'The wordmark is an asset, never type. Import Logo (React) or inline brand/logo/svg/*.svg.',
    test: ({ src, lines }) => {
      if (/from\s+['"][^'"]*\/logo['"]|<Logo\b/.test(src)) return []
      return lines.flatMap((l, i) =>
        // The wordmark as the entire VISIBLE text of an element. sr-only text is the
        // accessible name for a logo link — correct practice, not a violation;
        // the placeholder-brand-mark rule below is what catches that case.
        /\bsr-only\b/.test(l)
          ? []
          : [...l.matchAll(new RegExp(`>\s*${WORDMARK}\s*<`, 'gi'))].map((m) => ({
              line: i + 1,
              detail: `"${m[0].trim()}" — wordmark typeset as text`,
            }))
      )
    },
  },
  {
    id: 'placeholder-brand-mark',
    implements: 'logo-untouchable',
    severity: 'error',
    why: `A brand slot exists (sr-only "${WORDMARK}" or aria-label) but the real mark is absent — a generic icon is standing in for the wordmark. Import the Logo component.`,
    test: ({ src, lines }) => {
      if (/from\s+['"][^'"]*\/logo['"]|<Logo\b/.test(src)) return []
      return lines.flatMap((l, i) =>
        new RegExp(`(?:sr-only[^>]*>\s*${WORDMARK}\s*<|aria-label\s*=\s*["']${WORDMARK}["'])`, 'i').test(l)
          ? [{ line: i + 1, detail: `brand slot labelled "${WORDMARK}" but no Logo component in this file` }]
          : []
      )
    },
  },
  {
    // The bug an app shipped: a clickable home mark, <Button><Logo/></Button>. The
    // Button's base cva carries [&_svg:not([class*='size-'])]:size-4, which crushes
    // an UNSIZED <Logo> svg to a 16px square — distorting the 109:33 wordmark. The
    // library now defends (Logo sets inline width/height), but this still nudges the
    // caller to size it explicitly: belt-and-suspenders for older library versions
    // and for custom clickable wrappers that re-implement the same icon rule.
    id: 'logo-in-button',
    implements: 'logo-untouchable',
    severity: 'warn',
    why: "A Button's icon rule ([&_svg:not([class*='size-'])]:size-4) distorts an unsized <Logo> to a 16px square. Pass an explicit width= (or a size-/w-/h- class) to lock the 109:33 ratio.",
    test: ({ src }) => {
      const out = []
      // <Button> itself, or an asChild Radix trigger that renders its child as the
      // button (and so applies the same icon-sizing rule to a wrapped <Logo>).
      const OPEN = /<(Button|(?:Tooltip|DropdownMenu|Popover|Dialog|AlertDialog|Sheet|Drawer|HoverCard|ContextMenu|Menubar|Collapsible)Trigger)\b([^>]*)>/g
      let m
      while ((m = OPEN.exec(src))) {
        const tag = m[1]
        if (tag !== 'Button' && !/\basChild\b/.test(m[2])) continue // a trigger only sizes its child when asChild
        const end = src.indexOf(`</${tag}>`, m.index)
        const inner = end === -1 ? src.slice(m.index) : src.slice(m.index, end)
        const logo = /<Logo\b([^>]*?)\/?>/.exec(inner)
        if (!logo) continue
        const attrs = logo[1]
        const sized = /\bwidth\s*=/.test(attrs) || /\b(?:size|w|h)-/.test(attrs) // width prop, or a sizing class
        if (!sized) {
          out.push({
            line: src.slice(0, m.index + logo.index).split('\n').length,
            detail: `<Logo> inside <${tag}> with no explicit width — the button icon rule can distort the wordmark to a 16px square`,
          })
        }
      }
      return out
    },
  },
  {
    // Mechanises the "must" rule fixed-vs-theme-color. A <Logo> paints a FIXED
    // fill (black or white per variant), so an IN-APP mark has to adapt to the
    // theme — a .dark variant swap (variant="black" dark:hidden paired with
    // variant="white" hidden dark:block) or currentColor — OR sit on a FIXED
    // ground (bg-white / bg-neutral-950). A single fixed-variant Logo on a theme
    // surface vanishes in the other theme (a black mark disappears on the dark
    // ground). This caught a real one: login-05 shipped a bare <Logo/> invisible
    // in dark. It was advisory-only, so nothing flagged it — exactly the gap
    // between "passes the checks" and "looks right" this closes.
    id: 'fixed-vs-theme-color',
    implements: 'fixed-vs-theme-color',
    severity: 'error',
    why: 'A Logo has a FIXED fill, so an in-app mark must be theme-adaptive (a .dark variant swap or currentColor) or sit on a FIXED ground (bg-white / bg-neutral-950). A single fixed-variant Logo on a theme surface vanishes in the other theme.',
    test: ({ src }) => {
      const code = stripComments(src)
      const FIXED_GROUND = /bg-(?:white|black|(?:neutral|zinc|slate|gray|stone)-\d{2,3})\b/
      const out = []
      for (const m of code.matchAll(/<Logo\b([^>]*?)\/?>/g)) {
        const attrs = m[1]
        // Adaptive: this tag carries a dark: utility (one half of a .dark swap) or currentColor.
        if (/\bdark:/.test(attrs) || /currentColor/i.test(attrs)) continue
        // Fixed ground: a literal-colour background on an enclosing element nearby.
        if (FIXED_GROUND.test(code.slice(Math.max(0, m.index - 280), m.index))) continue
        out.push({
          line: code.slice(0, m.index).split('\n').length,
          detail: '<Logo> is not theme-adaptive and has no fixed ground — a fixed-fill mark vanishes in the other theme. Pair variant="black" dark:hidden with variant="white" hidden dark:block, or place it on bg-white / bg-neutral-950.',
        })
      }
      return out
    },
  },
  {
    id: 'multiple-primary-buttons',
    implements: 'one-primary',
    severity: 'error',
    why: 'One primary action per view. Pair a secondary/outline with it for lesser actions.',
    test: ({ src }) => {
      const isPrimary = (attrs) => !/variant\s*=/.test(attrs) || /variant\s*=\s*["{]?['"]?default/.test(attrs)
      // Partition the file into rendered VIEWS, then count primaries per view — not
      // per file. Each top-level component is a view, and inside it each overlay/tab
      // content (Dialog/Sheet/Popover/Drawer/AlertDialog/HoverCard/Tabs) is its own
      // rendered view. Two route components (or two dialogs) with one primary each is
      // correct; two primaries in ONE view is the violation.
      const starts = []
      const decl = /(?:^|\n)(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*(?::[^=\n]+)?=)/g
      let d
      while ((d = decl.exec(src))) starts.push(d.index + (src[d.index] === '\n' ? 1 : 0))
      if (!starts.length || starts[0] > 0) starts.unshift(0)
      const OVERLAY = /<(?:Dialog|AlertDialog|Sheet|Drawer|Popover|HoverCard|Tabs)Content\b/g
      const out = []
      for (let k = 0; k < starts.length; k++) {
        const from = starts[k]
        const to = k + 1 < starts.length ? starts[k + 1] : src.length
        const body = src.slice(from, to)
        const cuts = [0, ...[...body.matchAll(OVERLAY)].map((m) => m.index)].sort((a, b) => a - b)
        for (let j = 0; j < cuts.length; j++) {
          const seg = body.slice(cuts[j], j + 1 < cuts.length ? cuts[j + 1] : body.length)
          const prims = [...seg.matchAll(/<Button\b([^>]*)>/g)].filter((m) => isPrimary(m[1]))
          if (prims.length > 1) {
            for (const m of prims.slice(1)) {
              const abs = from + cuts[j] + m.index
              out.push({ line: src.slice(0, abs).split('\n').length, detail: `${prims.length} primary Buttons in one view — only one may be primary` })
            }
          }
        }
      }
      return out
    },
  },
  {
    id: 'inline-spacing',
    implements: 'one-spacing-scale',
    severity: 'warn',
    why: 'One 8px spacing scale via Tailwind utilities. Ad-hoc inline margins are the most visible inconsistency tell (rule 3).',
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        [...l.matchAll(/style=\{\{[^}]*\b(margin|padding|gap)[A-Za-z]*\s*:/g)].map((m) => ({
          line: i + 1,
          detail: `inline ${m[1]} — use the spacing scale`,
        }))
      ),
  },
  {
    id: 'off-scale-spacing',
    implements: 'one-spacing-scale',
    severity: 'warn',
    why: `Arbitrary spacing values sit off the ${SPACING_BASE}px scale. Prefer a scale step (gap-4, p-6).`,
    test: ({ lines }) =>
      lines.flatMap((l, i) =>
        [...l.matchAll(/\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-\[(\d+)px\]/g)]
          .filter((m) => Number(m[1]) % SPACING_BASE !== 0)
          .map((m) => ({ line: i + 1, detail: `${m[0]} is off the 4/8px scale` }))
      ),
  },
  {
    id: 'handrolled-card',
    implements: 'one-container',
    severity: 'warn',
    why: 'Every panel is a real Card — same border, radius, padding, shadow (rule 4). Do not build a parallel container.',
    test: ({ lines }) =>
      lines.flatMap((l, i) => {
        if (!/<div\b/.test(l)) return []
        const hasBorder = /\bborder\b/.test(l)
        const hasRadius = /\brounded-(?:lg|xl|2xl)\b/.test(l)
        const hasSurface = /\bbg-(?:card|background|white)\b/.test(l) || /\bshadow-/.test(l)
        return hasBorder && hasRadius && hasSurface
          ? [{ line: i + 1, detail: 'div styled as a card — use <Card> instead' }]
          : []
      }),
  },
  {
    id: 'color-only-state',
    implements: 'no-color-alone',
    severity: 'warn',
    why: 'Never signal state by colour alone — pair with an icon or text, plus aria-invalid (rule 5, non-negotiable).',
    test: ({ src, lines }) => {
      // A non-colour signal can be validation semantics OR a trend direction cue
      // (arrow/chevron) — a data delta coloured success/danger beside a
      // TrendingDown/ArrowDown icon is not colour-alone (rule: validation-only).
      const hasSignal = SIGNAL.test(stripComments(src))
      if (hasSignal) return []
      return lines.flatMap((l, i) =>
        /\b(?:border|text|ring)-destructive\b/.test(l)
          ? [{ line: i + 1, detail: 'destructive styling with no aria-invalid / error text nearby' }]
          : []
      )
    },
  },

  /*
    ---- detectors added when the authored rules were wired in ----

    These six implement rules that had been sitting in ux-rules.json with
    nothing behind them. They were chosen by running the checker over an
    app-shaped component — a subscription-tier picker for a streaming build —
    that broke six authored rules and returned "✓ no violations". Every one of
    them is a mistake a model makes constantly and a reviewer stops noticing.

    Each is deliberately narrow. A checker that cries wolf gets switched off,
    which costs more than the rule was worth.
  */
  {
    id: 'chromatic-decoration',
    implements: 'validation-only',
    severity: 'error',
    why: 'The only chromatic tokens are for validation state. Using them to decorate a badge, a tier or a category makes them stop reading as "something is wrong".',
    test: ({ src }) => {
      /*
        Two things legitimately carry a validation hue: a surface REPORTING
        state (Alert, FormMessage) and a control PERFORMING a destructive
        action (a Delete button, a Delete menu item) — the latter is governed
        by destructive-intent, not by this rule. Anything else wearing the
        colour is decoration, which is what the rule forbids.
      */
      const VALIDATION_HOSTS = /^(?:Alert|FormMessage|FieldError|Toast|Toaster|Button)|(?:Item|Action|Trigger)$/
      if (SIGNAL.test(stripComments(src)) || /FormMessage/.test(stripComments(src))) return []
      if (!VALIDATION_NAMES.length) return []
      const hue = new RegExp(`\\b(?:${VALIDATION_NAMES.join('|')})\\b`)
      return [...src.matchAll(/<([A-Z][\w]*)\b([^>]*)>/g)]
        .filter((m) => !VALIDATION_HOSTS.test(m[1]) && hue.test(m[2]))
        .map((m) => ({
          line: src.slice(0, m.index).split('\n').length,
          detail: `<${m[1]}> is styled with a validation hue but carries no validation state`,
        }))
    },
  },
  {
    id: 'unguarded-motion',
    implements: 'reduced-motion',
    severity: 'error',
    why: 'Transform and keyframe animation must be gated on prefers-reduced-motion (Tailwind: the motion-reduce: variant). Vestibular disorders make unguarded movement genuinely painful, not merely annoying.',
    test: ({ src, lines }) => {
      if (/motion-reduce:|prefers-reduced-motion|useReducedMotion/.test(stripComments(src))) return []
      /*
        Only movement, not every transition. `transition-colors duration-150`
        is ubiquitous, harmless, and flagging it would bury the real cases —
        which are transforms and keyframe animations.
      */
      const keyframe = /\banimate-(?!none\b)[a-z0-9-]+/
      const transform = /\b(?:transition-transform|(?:hover|focus|group-hover):(?:scale|-?translate|rotate|skew)-)/
      return lines.flatMap((l, i) => {
        const long = Number(l.match(/\bduration-(\d+)\b/)?.[1] ?? 0) >= 300
        const hit = keyframe.test(l) || (transform.test(l) && long)
        return hit ? [{ line: i + 1, detail: `${l.trim().slice(0, 70)} — no motion-reduce: variant in this file` }] : []
      })
    },
  },
  {
    id: 'literal-content-array',
    implements: 'no-hardcoded-ui-data',
    severity: 'error',
    why: 'Content belongs in data, not in the component that renders it. A literal array of records inlined next to the JSX is the single most common way generated UI ships fake product data that nobody notices until a demo.',
    test: ({ src, file }) => {
      if (!/<\/|\/>/.test(src)) return [] // not a view
      /*
        A block or page pattern is a TEMPLATE, and placeholder content is what it is for — a
        pricing block ships three specimen tiers precisely so a consumer can
        replace them. Run without this exemption the rule reported the payload's
        own marketing blocks as violations, which would have taught everyone to
        ignore it. The rule bites where it should: once that block is copied
        into an app, it is no longer a template and the placeholder data is
        exactly the fake product data this rule exists to catch.
      */
      const here = file.replace(/\\/g, '/')
      const templateDirs = ['blocks', 'patterns'].map((k) => { try { return cfg.rel(k) } catch { return null } }).filter(Boolean)
      if (templateDirs.some((d) => here.includes(`/${d}/`))) return []
      const out = []
      // Module-scope `const NAME = [{ … }]` with at least two records, whose
      // NAME is then mapped in the JSX. Arrays of strings are config, not
      // content, so the opening `[{` is load-bearing.
      for (const m of src.matchAll(/^const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]*)?=\s*\[\s*\{/gm)) {
        const name = m[1]
        let depth = 0
        let end = m.index + m[0].lastIndexOf('[')
        for (let i = end; i < src.length; i++) {
          if (src[i] === '[') depth++
          else if (src[i] === ']' && --depth === 0) { end = i; break }
        }
        const body = src.slice(m.index, end)
        const records = (body.match(/\{/g) ?? []).length
        if (records < 2) continue
        if (!new RegExp(`\\b${name}\\s*(?:\\?\\.)?\\.map\\s*\\(`).test(src)) continue
        // Distinguish CONFIG/structure from CONTENT. Skip: config-shaped names
        // (NAV / TABS / ROUTES / COLUMNS / …); arrays whose records carry structure —
        // an icon or component reference, an event handler, or a route/id/key field;
        // and an explicit `2one-allow` / `content-allow` comment above the array. What
        // stays flagged is inline records of pure content strings — the fake product
        // data this rule exists to catch (a testimonial list, priced plans, etc.).
        const CONFIG_NAME = /^(NAV\w*|TABS?|ROUTES?|MENUS?|LINKS?|STEPS?|COLUMNS?|FIELDS?|DESTINATIONS?|SECTIONS?|FILTERS?|BREADCRUMBS?|NAVIGATION|SOCIALS?)$/i
        // Structural signals = navigation/interaction, NOT "any data list". Note `id`
        // and `key` are deliberately excluded — every list of records has them, so
        // they say nothing about config-vs-content (a plans/testimonials array has ids too).
        const structural =
          /\bicon\s*:/.test(body) || /:\s*<[A-Z]/.test(body) || /:\s*[A-Z][\w.]*\s*[,}\n]/.test(body) ||
          /\bon[A-Z]\w*\s*:/.test(body) || /\b(href|to|route|component|Icon)\s*:/.test(body)
        const allowed = /(?:2one-allow|content-allow)/i.test(src.slice(Math.max(0, m.index - 160), m.index))
        if (CONFIG_NAME.test(name) || structural || allowed) continue
        out.push({
          line: src.slice(0, m.index).split('\n').length,
          detail: `${name} — ${records} records of UI content hardcoded in the view`,
          name,
        })
      }
      return out
    },
  },
  {
    id: 'no-empty-state',
    implements: 'empty-state',
    severity: 'warn',
    why: 'A list rendered straight from .map() shows nothing at all when the collection is empty — indistinguishable from a broken page. Give it an empty state.',
    test: ({ src, lines }) => {
      if (/\.length\s*(?:===?|<|>|\?|&&|\|\|)|isEmpty|EmptyState|No results|\bnothing\b/i.test(stripComments(src))) return []
      /*
        Only OPTIONAL chains — `items?.map(...)`.

        A plain `.map()` is usually over data the file itself owns: a literal
        constant, or a field of one (`col.links`, `t.features`). Flagging those
        produced four findings against the payload's own blocks, none of which
        could ever render empty. The optional chain is the author stating that
        the collection may be absent — and then rendering nothing when it is,
        which is the actual bug this rule describes.

        This misses a required-but-empty array. That is the right trade: a rule
        with false positives gets switched off, and then it catches nothing.
      */
      return lines.flatMap((l, i) => {
        const m = l.match(/([A-Za-z_$][\w$.]*)\s*\?\.map\s*\(/)
        return m && /[<{]/.test(l) ? [{ line: i + 1, detail: `${m[1]} is mapped with no empty branch` }] : []
      })
    },
  },
  {
    id: 'suppressed-focus-ring',
    implements: 'focus-visible',
    severity: 'error',
    why: 'Removing the outline without providing a focus-visible replacement makes the UI unusable by keyboard. This is the most common accessibility regression in generated code because the outline is the first thing that looks wrong.',
    test: ({ src, lines }) => {
      if (/focus-visible:/.test(stripComments(src))) return []
      return lines.flatMap((l, i) =>
        /\boutline-none\b|\boutline:\s*none\b/.test(l)
          ? [{ line: i + 1, detail: 'outline removed with no focus-visible: replacement in this file' }]
          : []
      )
    },
  },
  /*
    ---- L4: draft completeness ----

    A draft's job is to specify, and a specification that shows only the happy
    path is not one — a developer has to invent the rest, which is the drift
    the system exists to prevent. These check that a state was DRAWN, not that
    it looks right.

    `both-themes` has no detector on purpose: whether a screen was rendered
    twice is a property of the delivered set, not of any one file, and belongs
    to a draft-level audit. It stays authored and advisory rather than being
    faked with a regex that would pass on any file mentioning `dark:`.
  */
  {
    id: 'no-error-state',
    implements: 'error-state',
    severity: 'error',
    why: 'A surface that loads data must render an explicit failure path. Loading and empty get drawn; error is the one that gets omitted, and it is the state the user is most likely to be stuck in.',
    test: ({ src, lines }) => {
      const code = stripComments(src)
      // Only surfaces that actually load something.
      const loads = /use(?:Query|SWR|Suspense|Fetch)\b|\bfetch\s*\(|\bawait\s|\.then\s*\(/.test(code)
      if (!loads) return []
      if (/isError|hasError|\berror\b|onError|catch\s*[({]|ErrorBoundary|<Alert/.test(code)) return []
      const at = lines.findIndex((l) => /use(?:Query|SWR|Suspense|Fetch)\b|\bfetch\s*\(|\bawait\s/.test(l))
      return [{ line: at + 1, detail: 'loads data but renders no error state — a failure falls through to loading or empty' }]
    },
  },
  {
    id: 'handrolled-control',
    implements: 'interactive-states',
    severity: 'error',
    why: 'A hand-rolled control must define hover, focus-visible, active and disabled. Using the library Button is always the better answer — it carries all four already.',
    test: ({ src }) => {
      const code = stripComments(src)
      const out = []
      /*
        Only HAND-ROLLED controls. The library Button carries all four states
        internally, so checking every <Button> would report the system against
        itself. What this catches is the div-with-onClick and the bare
        <button> — the two shapes that ship with a resting state and nothing
        else.
      */
      for (const m of code.matchAll(/<(button|div|span|li)\b([^>]*)>/g)) {
        const attrs = m[2]
        const clickable = m[1] === 'button' || /\bonClick\s*=/.test(attrs)
        if (!clickable) return out
        const missing = ['hover:', 'focus-visible:', 'active:', 'disabled'].filter((s) => !attrs.includes(s))
        if (missing.length < 2) continue
        out.push({
          line: code.slice(0, m.index).split('\n').length,
          detail: `hand-rolled <${m[1]}> control missing ${missing.join(', ')} — use the library Button`,
        })
      }
      return out
    },
  },

  /*
    ---- L5: data-display integrity ----

    A draft is made of invented data, and drafts get screenshotted into decks.
    That makes truthfulness of the display a first-order concern here in a way
    it is not for a component library — which is why `data-integrity` sits
    directly after accessibility in the precedence order.

    `placeholder-marked` and `no-chartjunk` are authored without detectors.
    Whether a caption reads as a disclaimer, and whether an area fill is
    ornament or encoding, are judgements a regex does not have; asserting them
    mechanically would produce exactly the noise that gets a checker disabled.
  */
  {
    id: 'truncated-axis',
    implements: 'chart-baseline',
    severity: 'error',
    why: 'Bar length and area encode magnitude, so a value axis that does not start at zero exaggerates differences — the most common way a chart lies without its author intending it.',
    test: ({ src, lines }) => {
      const code = stripComments(src)
      if (!/<(?:Bar|Area)\b/.test(code)) return [] // line charts may legitimately truncate
      return lines.flatMap((l, i) => {
        const m = l.match(/domain=\{\[\s*([^,\]]+)/)
        if (!m) return []
        const low = m[1].trim().replace(/['"]/g, '')
        return low === '0' || low === 'dataMin' ? [] : [{ line: i + 1, detail: `bar/area chart with value axis starting at ${low}, not 0` }]
      })
    },
  },
  {
    id: 'ambiguous-date',
    implements: 'unambiguous-formats',
    severity: 'error',
    why: 'An all-numeric slash date is two different days depending on the reader. Use ISO (2026-03-04) or name the month (4 Mar 2026).',
    test: ({ src }) => {
      /*
        A date sits inside a sentence — "Renews 03/04/2026" — so requiring it
        to be flush against the quote or tag missed every real one. Match it
        anywhere, and exclude what else uses slashes: import paths and URLs by
        line, and path segments by the leading lookbehind. Aspect ratios and
        fractions (16/9, w-1/2) have only two parts and never match.
      */
      return stripComments(src).split('\n').flatMap((l, i) => {
        if (/\bfrom\s+['"]|https?:|:\/\//.test(l)) return []
        return [...l.matchAll(/(?<![\w/.])(\d{1,2}\/\d{1,2}\/\d{2,4})(?![\w/])/g)].map((m) => ({
          line: i + 1,
          detail: `"${m[1]}" is ambiguous — day/month order is reader-dependent`,
        }))
      })
    },
  },
  {
    id: 'proportional-figures',
    implements: 'tabular-numerics',
    severity: 'warn',
    why: 'Figures set in a column need tabular-nums, or proportional digits make the column ragged and defeat the comparison the table exists for.',
    test: ({ src, lines }) => {
      const code = stripComments(src)
      if (/tabular-nums|tabular_nums/.test(code)) return []
      if (!/<(?:TableCell|td)\b/.test(code)) return []
      const at = lines.findIndex((l) => /<(?:TableCell|td)\b/.test(l))
      return [{ line: at + 1, detail: 'table of figures with no tabular-nums — digits will not align down the column' }]
    },
  },
  {
    id: 'mono-outside-code',
    implements: 'mono-for-code-only',
    severity: 'warn',
    why: 'The monospace face is reserved for code, keys and identifiers. Used for body copy or numbers it reads as a terminal, not as this system.',
    test: ({ src, lines }) => {
      if (/<(?:code|pre|kbd)\b|<Code\b|<Kbd\b/.test(stripComments(src))) return []
      return lines.flatMap((l, i) =>
        /\bfont-mono\b/.test(l) ? [{ line: i + 1, detail: 'font-mono with no code element in this file' }] : []
      )
    },
  },
  {
    // The AI-hero cliché: a pill Badge stacked directly above the H1. The SHAPE,
    // not any single class, is the tell, so this flags a <Badge>…</Badge> whose
    // next element is an <h1> (only whitespace between).
    id: 'badge-above-h1',
    implements: 'hero-badge-cliche',
    severity: 'warn',
    why: 'A pill badge immediately above the hero H1 is the signature AI-generated landing shape. Integrate the eyebrow, drop it, or use a left-aligned / asymmetric hero.',
    test: ({ src }) => {
      const s = stripComments(src)
      return [...s.matchAll(/<Badge\b[^>]*>[\s\S]*?<\/Badge>\s*<h1\b/g)].map((m) => ({
        line: s.slice(0, m.index).split('\n').length,
        detail: 'a <Badge> sits directly above an <h1>, the AI-hero cliché',
      }))
    },
  },
  {
    // Em-dash DENSITY — the clearest tell of AI-written copy. Counts em-dashes in
    // the comment-stripped source (code comments do not count) and warns once a
    // single view leans on them (four or more).
    id: 'em-dash-overuse',
    implements: 'copy-em-dash',
    severity: 'warn',
    why: 'The copy leans on the em-dash, the clearest tell of AI-written prose. Vary the punctuation (commas, colons, periods, parentheses) and keep em-dashes occasional.',
    test: ({ src }) => {
      const n = (stripComments(src).match(/—/g) || []).length
      return n >= 4 ? [{ line: 1, detail: `${n} em-dashes in one view; vary the punctuation` }] : []
    },
  },
]

/*
  ---- resolve each detector against the payload ----

  Severity and prose come from the authored rule where there is one. A detector
  whose rule the payload does not carry is dropped: shipping a rules file and
  leaving a rule out of it is how a payload declines that rule.
*/
const ACTIVE = RULES.map((r) => {
  const a = authored?.get(r.implements)
  if (authored && !a) return null
  if (!a) return r
  return {
    ...r,
    severity: SEVERITY[a.severity] ?? r.severity,
    label: a.label,
    why: [a.statement, a.rationale].filter(Boolean).join(' '),
  }
}).filter(Boolean)

/*
  ---- coverage ----

  The number that was missing. "✓ no violations" is only meaningful alongside
  how many of the system's rules could have produced one; without it a clean
  run reads as "this conforms" when it means "none of the rules I can check
  were broken". Reporting the uncovered rules turns the advisory ones from
  invisible into merely unenforced, which is a different and honest claim.
*/
const covered = new Set(ACTIVE.map((r) => r.implements).filter(Boolean))
const uncovered = authored ? [...authored.values()].filter((r) => !covered.has(r.id)) : []
const coverage = authored
  ? { total: authored.size, checked: covered.size, advisory: uncovered.map((r) => ({ id: r.id, severity: r.severity, label: r.label })) }
  : null

// ---- collect files ----
const CODE = new Set(['.tsx', '.jsx', '.ts', '.js', '.html'])

/*
  Build output and dependencies are never source, and scanning them is both slow
  and WRONG: a compiled bundle trips every regex, and a clean scan of dist/ or
  node_modules is a false "audit passed". Skipped by default; a consumer adds more
  via .2oneignore, .gitignore, or repeatable `--ignore <glob>`.
*/
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', 'out', '.next', '.nuxt', '.svelte-kit', '.vite', '.turbo', '.cache', '.git', '.vercel', '.output', '.parcel-cache'])
const ignoreGlobs = []
for (let i = 0; i < args.length; i++) if (args[i] === '--ignore' && args[i + 1]) ignoreGlobs.push(args[i + 1])
for (const f of ['.2oneignore', '.gitignore']) {
  try {
    for (const l of readFileSync(join(process.cwd(), f), 'utf8').split('\n')) {
      const t = l.trim()
      if (t && !t.startsWith('#') && !t.startsWith('!')) ignoreGlobs.push(t.replace(/^\/+/, '').replace(/\/+$/, ''))
    }
  } catch { /* file absent — fine */ }
}
const globToRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, ' ').replace(/\*/g, '[^/]*').replace(/ /g, '.*').replace(/\?/g, '.') + '$')
const ignoreRes = ignoreGlobs.map(globToRe)
const isIgnored = (name, rel) => IGNORE_DIRS.has(name) || ignoreRes.some((re) => re.test(name) || re.test(rel))

const walk = (p, base = p, acc = []) => {
  const s = statSync(p)
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) {
      if (f.startsWith('.')) continue // dotfiles/-dirs skipped (as before)
      const abs = join(p, f)
      const rel = relative(base, abs).replace(/\\/g, '/')
      if (isIgnored(f, rel)) continue
      const st = statSync(abs)
      if (st.isDirectory()) walk(abs, base, acc)
      else if (CODE.has(extname(abs))) acc.push(abs)
    }
  } else if (CODE.has(extname(p))) acc.push(p) // an explicitly-named file target is always scanned
  return acc
}

/*
  A user-supplied target ("2one check src") is a CLI path, resolved from where the
  command was RUN (like eslint/tsc). With NO target, the default depends on where the
  checker lives: in the design-system repo it audits the payload's own template tiers
  (blocks / patterns / assistant elements); in a CONSUMER project — where `root`
  falls back to the installed package inside node_modules — it must NEVER scan that
  unshipped package, so it audits the consumer's OWN src/ instead. And zero scannable
  files is an ACTIONABLE failure, never a silent "audit passed".
*/
const resolveTarget = (t) => (t.startsWith('/') || /^[A-Za-z]:/.test(t) ? t : join(process.cwd(), t))
const inNodeModules = (p) => p.replace(/\\/g, '/').includes('/node_modules/')
const positional = []
for (let i = 0; i < args.length; i++) { if (args[i] === '--ignore') { i++; continue } if (!args[i].startsWith('--')) positional.push(args[i]) }

let inputs
let scannedLabel
if (positional.length) {
  inputs = positional.map(resolveTarget)
  scannedLabel = positional.join(', ')
} else {
  const payloadDirs = ['blocks', 'patterns', 'aiComponents']
    .map((k) => { try { return join(root, cfg.rel(k)) } catch { return null } })
    .filter((d) => d && existsSync(d) && !inNodeModules(d))
  if (payloadDirs.length) { inputs = payloadDirs; scannedLabel = 'the design system’s own templates' }
  else {
    const cwdSrc = join(process.cwd(), 'src')
    inputs = [existsSync(cwdSrc) ? cwdSrc : process.cwd()]
    scannedLabel = existsSync(cwdSrc) ? 'src' : 'this project'
  }
}

const files = inputs.flatMap((p) => {
  try {
    return walk(p)
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error(`\n  check-usage: no such file or directory: ${p}\n`)
      process.exit(1)
    }
    throw e
  }
})

if (!files.length) {
  console.error(
    `\n  check-usage: no scannable files found in ${scannedLabel}.\n` +
      `  Looked for ${[...CODE].join(' ')} files (skipping node_modules, dist, build, …).\n` +
      `  ${positional.length ? 'Check the path you passed.' : 'Point it at your source, e.g. `npx 2one check src`.'}\n`,
  )
  process.exit(1)
}

// ---- run ----
const findings = []
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')
  for (const rule of ACTIVE) {
    for (const hit of rule.test({ src, lines, file })) {
      findings.push({
        file: relative(root, file).replace(/\\/g, '/'),
        line: hit.line,
        rule: rule.id,
        // The authored rule this detector enforces — the id a payload author,
        // the graph and graph-decide all know it by.
        enforces: rule.implements ?? null,
        severity: rule.severity,
        detail: hit.detail,
        why: rule.why,
      })
    }
  }
}

const errors = findings.filter((f) => f.severity === 'error')
const warns = findings.filter((f) => f.severity === 'warn')

if (asJson) {
  console.log(JSON.stringify({ scanned: files.length, errors: errors.length, warnings: warns.length, degraded: !coverage, coverage, findings }, null, 2))
} else {
  const scope = coverage ? `${coverage.checked} of ${coverage.total} ${cfg.name} rules` : `the ${cfg.name} rules`
  console.log(`\n  check-usage — ${files.length} file(s) scanned against ${scope}\n`)
  // Degraded mode: the payload's rules file couldn't be resolved from `root`, so
  // only the built-in detectors ran — a REDUCED set. Say so loudly; a silent
  // "the N rules" (with no count) reads like full coverage when it isn't.
  if (!coverage) {
    const rel = cfg.rel('rules')
    console.log(
      `  ⚠ Degraded coverage — no ${cfg.name} rules file resolved` +
        (rel ? ` (looked for "${rel}" under ${root})` : '') + `.\n` +
        `    Only the built-in detectors ran, not this system's full ruleset.\n` +
        `    Run from a project with dls.config.json (or inside the DLS repo, passing\n` +
        `    your app path as the target) for full coverage. A clean run here does\n` +
        `    NOT mean the ${cfg.name} rules hold.\n`,
    )
  }
  if (!findings.length) {
    // Never "✓ no violations" unqualified — that is the sentence that made an
    // inert rule look like a passing one for weeks.
    console.log(coverage ? `  ✓ no violations of the ${coverage.checked} checkable rules\n` : '  ✓ no violations\n')
  } else {
    let current = ''
    for (const f of [...errors, ...warns]) {
      if (f.file !== current) {
        current = f.file
        console.log(`  ${f.file}`)
      }
      const tag = f.severity === 'error' ? 'error' : 'warn '
      console.log(`    ${tag}  ${String(f.line).padStart(4)}  ${f.rule}  —  ${f.detail}`)
      console.log(`                 ${f.why}`)
    }
    console.log(`\n  ${errors.length} error(s), ${warns.length} warning(s)\n`)
  }

  if (coverage?.advisory.length) {
    const musts = coverage.advisory.filter((r) => r.severity === 'must' || r.severity === 'forbidden')
    console.log(
      `  ${coverage.advisory.length} rule(s) are ADVISORY — written in ${cfg.rel('rules')} but not mechanically checked` +
        (musts.length ? `, ${musts.length} of them "must"` : '') + '.',
    )
    if (draft && musts.length) {
      // --draft: a static run cannot judge these, so PROMPT the reviewer by name —
      // a "must" is never silently skipped. Confirm each by eye before shipping.
      console.log('\n  Draft review — confirm each advisory "must" by eye (a static run can\'t):')
      for (const r of musts) console.log(`    ☐ ${r.id.padEnd(24)} ${r.label}`)
      console.log('')
    } else if (args.includes('--coverage')) {
      for (const r of coverage.advisory) console.log(`    · ${r.id.padEnd(26)} ${r.severity.padEnd(9)} ${r.label}`)
    } else {
      console.log('  Re-run with --coverage to list them, or --draft for a review checklist of the "must" rules. A clean run does not mean these hold.\n')
    }
  }
  // The unmissable line. A clean run is a STATIC check of the rules it can
  // mechanise — it says nothing about sizing, proportion, or visual consistency,
  // and it never looked at a rendered pixel. The video-app defects (a crushed logo,
  // pills that broke on asChild triggers) all passed this. Rule 16 / 24.
  console.log(`  ${findings.length ? '—' : '✓'} check-usage is STATIC. A clean run does NOT cover sizing, proportion or
    visual consistency, and it has not rendered anything. Before you call it done,
    eyeball the page in BOTH themes at multiple widths (docs/building-with-the-dls.md
    rule 16). "Passes the checks" is not "looks right".\n`)
}

process.exit(errors.length || (strict && warns.length) ? 1 : 0)
