# Progress Report: CompatibilityCorpus/v0

## Delivered

Entry 525 adds the first package-level compatibility index over the existing
`CompatibilityJourney/v1` evidence. The result separates required legal,
portable legal, and optional private routes, publishes route and unsupported
feature density, and keeps binary package payloads out of the aggregate.

The parser is fail-closed for missing required journeys, duplicate identities,
unverified licenses, missing optional reasons, non-normalized claims, summary
drift, status drift, and checksum tampering.

## Evidence

- Focal suite: 1 file / 3 tests passed.
- TypeScript 7 typecheck and `git diff --check`: passed.
- Full suite: 210 test files / 2125 tests passed with
  `pnpm test -- --maxWorkers=4`.
- Production build: 289 modules; 1,782.11 kB JavaScript / 447.37 kB gzip.
  The existing large-chunk warning remains open.
- Boundary check: passed.
- CSS budget: 324085/536051 bytes, 1519/2364 rules, zero duplicate selector
  keys, zero exact duplicate rules, and zero fully shadowed cross-file rules.
- Trace corpus: 600/600 artifacts passed, 566 required and 34 optional.
- No visible runtime, Studio, stage, or renderer surface changed, so the
  existing Runtime/Tag/Studio browser smoke remains the visual baseline.
- Code commit: `8d33f126 feat: add compatibility corpus v0`.

## Quality audit

- Package identity is stable and unique at the corpus boundary.
- The optional/private absence path is explicit rather than silently counted as
  a compatibility pass.
- Unsupported controller findings remain summarized instead of being erased by
  aggregation.
- Deep immutability protects the generated report from post-build mutation.
- Serialized round-trip accepts a generated result and rejects checksum drift.

## Claim and score status

Scores remain unchanged. This is an evidence-index and claim-control feature,
not a new character/stage route. The allowed claim is limited to the measured
journey envelope; broad public compatibility and full MUGEN/IKEMEN parity
remain blocked.

## Next

Run the written score-band adjudication against this corpus version, then gate
one independent legal stage or package route with its own evidence.
