/*
  run-evals — proves the guardrail still bites, in both directions.

  This is a GUARDRAIL eval, not a generation eval, and the distinction matters.
  It does not call a model: that would need a key, cost money, and return a
  different answer every run, so it could never gate a build. What it does
  instead is fix the half that CAN be deterministic — given output an agent
  plausibly produces, does the checker reach the right verdict?

  Two directions, and the second is the one that has actually failed:

    *.fail.tsx   must trigger the rule named in its `@expect` comment
    *.pass.tsx   must be clean

  A rule that silently stops firing is the failure mode this exists for.
  dls.config.json did not ship, so in every consumer project `rules.wordmark`
  was null and the wordmark rule searched generated code for the literal string
  "design-system". It reported "no violations" and looked correct. Nothing in
  the gate could tell the difference between "no violations" and "not looking",
  because the only evidence was a word in a header.

  A pass-only suite would not have caught it. Neither would asserting an error
  count — `brand-wordmark.fail` would simply have stopped contributing one. The
  assertion has to be that a NAMED rule fired.

  Run: npm run evals
*/
import { readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const casesDir = join(root, 'evals/cases')

const check = (file) => {
  const r = spawnSync(
    process.execPath,
    [join(root, 'scripts/check-usage.mjs'), file, '--json'],
    { cwd: root, encoding: 'utf8' },
  )
  try {
    return JSON.parse(r.stdout).findings ?? []
  } catch {
    return { parseError: (r.stderr || r.stdout || '').trim().split('\n').slice(-3).join(' ') }
  }
}

const cases = readdirSync(casesDir).filter((f) => f.endsWith('.tsx')).sort()
if (!cases.length) {
  console.error('\n  evals: no cases found — evals/cases is empty.\n')
  process.exit(1)
}

const failures = []
const results = []

for (const name of cases) {
  const path = join(casesDir, name)
  const src = readFileSync(path, 'utf8')
  const findings = check(path)

  if (findings.parseError) {
    failures.push(`${name} — checker did not return JSON: ${findings.parseError}`)
    continue
  }
  const fired = new Set(findings.map((f) => f.rule))

  if (name.includes('.fail.')) {
    const expected = src.match(/@expect\s+([a-z0-9-]+)/)?.[1]
    if (!expected) {
      failures.push(`${name} — a .fail case must declare "// @expect <rule-id>"`)
      continue
    }
    if (fired.has(expected)) {
      results.push(`  ok    ${name.padEnd(28)} ${expected} fired`)
    } else {
      failures.push(
        `${name} — expected rule "${expected}" did NOT fire.` +
          (fired.size ? ` Fired instead: ${[...fired].join(', ')}.` : ' Nothing fired at all — the rule may be inert.'),
      )
    }
  } else {
    const errors = findings.filter((f) => f.severity !== 'warn')
    if (!errors.length) {
      results.push(`  ok    ${name.padEnd(28)} clean`)
    } else {
      failures.push(
        `${name} — conforming output was rejected: ${errors.map((e) => `${e.rule} (${e.detail})`).join('; ')}`,
      )
    }
  }
}

console.log('')
for (const r of results) console.log(r)

if (failures.length) {
  console.error(`\n  ✗ evals — ${failures.length} of ${cases.length} case(s) failed:\n`)
  for (const f of failures) console.error(`    ${f}`)
  console.error('')
  console.error('  A .fail case that stops firing means the rule went inert — the checker')
  console.error('  still exits 0 and still says "no violations", so nothing else notices.')
  console.error('  A .pass case that fails means the rules started blocking legitimate work.\n')
  process.exit(1)
}

const fails = cases.filter((c) => c.includes('.fail.')).length
console.log(`\n  ✓ evals — ${cases.length} cases: ${fails} rules proven to still fire, ${cases.length - fails} conforming outputs accepted\n`)
