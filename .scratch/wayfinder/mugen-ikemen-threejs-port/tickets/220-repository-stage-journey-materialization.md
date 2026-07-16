# Materialize repository stage journey evidence

Type: task
Status: resolved
Blocked by: None

## Question

Can the repository-authored Skyline Relay runtime and browser outputs be
serialized into one parser-valid compatibility artifact without promoting
native evidence that has not run?

## Answer

Yes. The materializer now writes `journey.json` with
`StageCompatibilityJourney/v1` plus `runtime.json` with
`mugen-web-sandbox/repository-stage-runtime/v1`. The journey parses with no
diagnostics, records runtime and browser as passed, keeps native regression as
explicitly `not-run`, and therefore resolves to `partial` with checksum
`d0be680a`.

## Authority

- `RepositoryStageJourney` owns the production loader/runtime journey and
  runtime snapshot artifact.
- `StageCompatibilityJourney` owns normalization, status, checksum, and
  parser validation.
- `qa:stage:repository` owns the real application ZIP/folder browser proof.
- `materialize:repository-stage-journey` owns the explicit aggregation step.

## Boundaries

Included: package digest, four runtime snapshots, four passing stage checks,
desktop/mobile browser artifact references, parser validation, and explicit
native `not-run` state.

Deferred: native regression execution, compatibility snapshot promotion, score
movement, arbitrary third-party package breadth, and complete MUGEN/IKEMEN
stage parity.

## Verification

- `pnpm run qa:stage:repository`: passed.
- `pnpm run materialize:repository-stage-journey`: passed.
- Full test suite: `220/220` files and `2293/2293` tests passed.
- `pnpm typecheck`: passed under TypeScript 7.
- `pnpm build`: passed; existing large-chunk warning remains.
- `pnpm run check:boundaries`: passed.
- `pnpm run qa:trace`: `633/633` passed, `599` required, `34` optional, `0`
  skipped.
- Materialized journey: `.scratch/qa/repository-skyline-relay-browser/journey.json`;
  checksum `d0be680a`, status `partial`, parser errors `0`.
- Runtime artifact: `.scratch/qa/repository-skyline-relay-browser/runtime.json`;
  package digest `sha256:9c8a0b7cbd8d298eda5450518045e8d67e5d9a4a409e3186c5eef33a7183b456`,
  next round applied, all four checks passed.
- Browser artifact references: desktop/mobile screenshots and canvas captures;
  `0` page errors, `0` console issues, no horizontal overflow.

Claim ceiling: the stage route is now aggregatable and parser-valid across
runtime and browser evidence. Native proof and snapshot promotion remain open;
no score moves from this ticket.
