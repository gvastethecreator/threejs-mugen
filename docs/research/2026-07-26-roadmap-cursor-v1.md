# RoadmapCursor/v1 (DA26-09)

Date: 2026-07-26
Type: control evidence
Status: closed

## Question

Can the repo store seven control cursors (HEAD, formal, focal, global, visual,
product, source) with branch, scores, dirty exclusions, per-cursor
SHA/date/artifact/claimLimit, and evaluate stale versus HEAD mismatch without
mixing writers or inflating scores?

## Answer

Yes. `RoadmapCursor/v1` is a pure control document with a stable digest and
freshness evaluator.

## Contract

- Schema: `mugen-web-sandbox/roadmap-cursor/v1`
- Required kinds: `head`, `formal`, `focal`, `global`, `visual`, `product`,
  `source`
- Each cursor: `sha`, `date`, `artifact`, `claimLimit`
- Document also carries `branch`, `scores`, `dirtyExclusions`, claims, and
  SHA-256 digest over the canonical payload
- Freshness:
  - `mismatch` when the head cursor SHA differs from observed HEAD
  - `stale` when generatedAt or head/global dates exceed `maxAgeMs` (default 24h)
  - `current` otherwise

## Evidence

- Implementation: `src/mugen/compatibility/RoadmapCursor.ts`
- Tests: `src/tests/RoadmapCursor.test.ts` (create, reverse-order stability,
  digest tamper, missing kind, stale, mismatch, committed artifact parse)
- Materializer: `pnpm materialize:roadmap-cursor`
- Artifact: `docs/evidence/roadmap-cursor-v1.json`

## Claim allowed

Control-state identity for named cursors and freshness evaluation.

## Claim blocked

Score movement, visual/product inheritance from older cursors, semantic source
promotion, and any runtime compatibility expansion.
