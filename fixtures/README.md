# Fixtures

> **Temporary.** These exist to prove the engine/payload seam while the
> separation is in progress. Delete this directory once the engine lives in its
> own repository and has its own test suite.

## `acme/` — a second payload

A deliberately unlike-2one design system: different directory layout, ramps
called `slate`/`alert`/`ok`, different fonts, no Canva integration, two
components instead of 57.

It exists because **running the engine against 2one alone proves nothing**. The
engine was written inside 2one, so every 2one-shaped assumption it holds is
invisible from there — the run succeeds either way.

Its first use found four bugs, three of which would have shipped:

| | Symptom against 2one | Reality |
| --- | --- | --- |
| Config resolved from the engine's own directory | worked | a client run silently operated on 2one's files |
| `build-tokens` wrote no token JSON at all | `check:meta` passed | stale files matched their committed state |
| Ramp names hardcoded to `neutral/accent/danger/success` | worked | Acme's whole palette discarded, success reported |
| Canva export took `ramps[0]` as the primary ramp | looked fine | 2one declares `accent` first — the brand kit quietly changed |

Every one failed **silently**. That is the point: a generator that writes
nothing looks exactly like one that writes the same thing, and only a payload
with different answers can tell them apart.

## Running it

```bash
npm run test:fixture      # engine against acme/, asserts payload isolation
```

The check asserts that Acme's output contains Acme's values and **none of
2one's** — no Satoshi, no `#09090b`, no `2one` in the generated manifest.

## When the engine moves out

Move `acme/` with it and keep the assertion as the engine's own regression test.
Nothing here belongs to 2one; it is scaffolding for the engine.
