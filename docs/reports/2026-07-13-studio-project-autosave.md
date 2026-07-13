# Studio Project Autosave

Date: 2026-07-13

## Closure

Studio now persists dirty project identity edits to the browser-local project
index after a 1.5 second debounce. Consecutive edits coalesce into one save,
explicit save cancels the pending timer, and manifest/source replacement also
cancels it before resetting the active project. The diagnostics bridge exposes
`pending` and `delayMs` so the browser proof can observe the state instead of
guessing from storage.

Implemented surfaces:

- `src/app/StudioAutosave.ts`: small timer controller with injectable timer API.
- `src/app/App.ts`: dirty-state scheduling, cancellation, autosave logging, and
  diagnostics bridge state.
- `src/tests/StudioAutosave.test.ts`: coalescing and cancellation coverage.
- `scripts/qa_smoke.cjs`: real browser wait plus localStorage assertion.

## Evidence

- Focused autosave/history/navigation check: `7/7` tests passed.
- Full Vitest: `188/188` files, `1971/1971` tests passed.
- TypeScript 7 typecheck: passed.
- Boundary check: passed.
- Production build: passed with the existing large-chunk advisory; JS output
  is `1,668.83 kB` minified (`419.14 kB` gzip).
- Runtime traces: `581/581` artifacts passed (`547` required, `34` optional),
  with no skipped optional fixtures.
- Playwright smoke: passed. The report proves dirty state before the timer,
  dismissible navigation guard, automatic local persistence, `dirty=false`,
  and no pending timer. It also keeps the independent Code Fu Man QCF and
  `upper_x` visual routes green.
- Browser artifacts: `.scratch/qa/qa-smoke/studio-project-authoring.png` and
  the corresponding `.scratch/qa/qa-smoke/diagnostics.json` report.

## Claim Ceiling

Allowed claim: debounced local autosave for the current Studio project
identity spine (`name`, P1, CPU/P2, and stage) with browser evidence.

Still blocked: filesystem/source writes, conflict resolution, versioned
migrations, multi-scene graphs, state/controller/collision authoring, and full
MUGEN/IKEMEN parity.
