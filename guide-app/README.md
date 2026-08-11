# DLS Guide App

The local-first way to explore the 2one Design Language System and answer questions
about it — **without live internet access**. Everything the app needs is in this repo.

## What's here

| File | Purpose |
| --- | --- |
| [`knowledge-base.md`](knowledge-base.md) | The full DLS + 2one knowledge base, structured for local Q&A. An AI (or a person) can answer questions from this file alone. |
| [`VERSIONLOG.md`](VERSIONLOG.md) | What's available in the DLS today vs. what's planned next. |
| [`feedback.md`](feedback.md) | Where users log feedback about the DLS. |
| `../dev/` | The visual showcase app (every component, live). |

## Run the visual showcase locally

**Requirements:** Node 18+.

```bash
git clone https://github.com/yokesh-2one/2one-design-library.git
cd 2one-design-library
npm install
npm run dev          # opens the showcase at http://localhost:4180
```

The showcase renders every component, the foundations (colour, type, radius), the
templates, and the charts — all from the real library source.

## Answer questions locally (offline)

Point any AI vendor at this repo and it can answer DLS questions with **no internet**:

1. Read [`../manifest.json`](../manifest.json) — the index + the rules for answering.
2. Read [`knowledge-base.md`](knowledge-base.md) for the DLS + 2one narrative.
3. Pull exact values from [`../tokens/*.json`](../tokens) and `../src/components/`.

The contract (in `manifest.json → instructions_for_ai`) is: **answer only from repo
content, cite the file, and say so when something isn't here — never guess.**

## Regenerate the machine-readable data

```bash
npm run tokens      # tokens/*.css → tokens/*.json (with contrast data)
npm run manifest    # rebuild manifest.json from the filesystem
npm run validate    # check the JSON against the schemas
npm run a11y        # APCA contrast audit
npm run build:meta  # all of the above (tokens + manifest + validate)
```
