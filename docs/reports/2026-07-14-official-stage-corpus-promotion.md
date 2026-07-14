# Report: Official stage corpus promotion

## Result

Entry 529 promotes the official Training Room route into
`CompatibilityCorpus/v0` as `optional-private`. The corpus now accepts both
character and stage compatibility journeys, preserves the journey schema
discriminator, and retains stage-specific unsupported-feature density without
embedding external assets.

## Implementation

- `CompatibilityCorpusJourney` is the union of character and stage journey
  results.
- Each populated corpus entry records `journeySchema`.
- Stage unsupported features are normalized from `StageCompatibilityReport`;
  character unsupported features keep their existing loader source.
- Corpus parsing rejects an unknown journey schema.
- The promotion test proves a passed stage route remains optional-private,
  carries browser/native evidence IDs, preserves both character and stage
  unsupported density, and does not serialize `stage0.sff`.

## Verification

- Focused corpus: 1 file / 4 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Broad closeout: 211 test files / 2129 tests passed with controlled workers.
- Build: 289 modules; the existing large JavaScript chunk advisory remains.
- Boundaries and CSS budget passed.
- Trace gate: 600/600 artifacts passed, 566 required and 34 optional.
- Browser stage gate: desktop/mobile Training Room import and render passed;
  0 console issues and 0 page errors.

## Claim ceiling

This is evidence organization and route promotion, not a score increase or a
claim of complete MUGEN/IKEMEN stage parity. The external stage remains outside
the repository as a noncommercial optional-private fixture.

## Next

Adjudicate the written score band, then continue with the next independent
stage/runtime compatibility gap.
