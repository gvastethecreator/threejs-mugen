# Execute repository-authored Skyline Relay stage journey

Type: task
Status: resolved
Blocked by: None

## Question

Can the second first-party stage package reach a typed compatibility journey
through the production loader and a bounded playable runtime without claiming
browser or native proof that does not exist yet?

## Answer

Yes, as a bounded T06-a slice. `repository-skyline-relay` now produces a
`StageCompatibilityJourneyResult` with a stable Web Crypto package digest,
production `MugenStageLoader`/`createStageCompatibilityReport` evidence, and
four passing runtime checks: loader, depth/localcoord, animated BGCtrl, and
`resetBG = 0` round-clock preservation. The journey remains `partial` because
browser and native evidence are explicitly `not-run`.

## Authority

- The repository-authored fixture manifest and VFS are the package authority.
- `MugenStageLoader` and `createStageCompatibilityReport` remain the only
  production stage loading/reporting path.
- `PlayableMatchRuntime` owns the bounded round transition observation.
- `StageCompatibilityJourney` owns status normalization and parser checks.

## Boundaries

Included: deterministic package digest, loader/report route, runtime snapshot
before and after the first frame, next-round application, stage depth, BGCtrl,
and background-clock checks, plus journey serialization round-trip coverage.

Deferred: folder/ZIP equivalence, importing the package through the visible
application, desktop/mobile browser artifacts, native build/regression proof,
snapshot aggregation, score movement, arbitrary third-party package breadth,
and complete MUGEN/IKEMEN stage parity.

## Verification

- Focused fixture and journey tests: `3/3` passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; existing large-chunk warning remains.
- `pnpm run check:boundaries`: passed.
- `pnpm run qa:trace`: passed with `633/633` artifacts and no skipped items.
- Isolated `pnpm test -- --testTimeout=30000`: `218/218` files and `2289/2289` tests passed.
- The earlier parallel checkpoint produced one Turns timeout under process
  contention; the isolated rerun passed and is the recorded suite evidence.
- No browser smoke was required: this slice adds evidence/runtime modules,
  not a visible UI route.

Claim ceiling: the repository stage now has loader and bounded runtime journey
evidence. T06 is not closed until the same package is proven through folder/ZIP
application loading and browser/native artifacts.
