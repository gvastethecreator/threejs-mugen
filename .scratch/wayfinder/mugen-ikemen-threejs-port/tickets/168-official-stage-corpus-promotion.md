# Ticket 168: Official stage corpus promotion

Status: closed
Entry: 529

## Question

How should the official Training Room stage join `CompatibilityCorpus/v0`
without being mistaken for character breadth or a redistributable binary
fixture?

## Decision

Keep the stage route `optional-private` and accept its existing
`StageCompatibilityJourney/v1` envelope beside `CompatibilityJourney/v1`.
Persist only the journey schema, package identity, route IDs, evidence IDs, and
normalized unsupported-feature density in the corpus entry. Validate the new
schema discriminator during parsing.

## Evidence

- `CompatibilityCorpus.test.ts`: 4/4 focused tests passed.
- TypeScript 7 typecheck passed.
- Native closeout passed: 211 files / 2129 tests, build, boundaries, CSS
  budget, and 600/600 trace artifacts.
- Entry 528 browser stage gate passed at desktop/mobile with zero browser
  diagnostics.
- Commits: `590acb23`, `440516e4`.

## Claim ceiling

Allowed: deterministic optional-private stage/package indexing with explicit
provenance and evidence references.

Blocked: score movement, commercial redistribution, full stage parity, and
committed external DEF/SFF payloads.

## Next

Adjudicate the score band, then choose the next independently evidenced
stage/runtime gap.
