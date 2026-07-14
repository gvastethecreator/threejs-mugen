# Ticket 164: CompatibilityCorpus/v0

Status: closed
Entry: 525

## Question

How should the existing `CompatibilityJourney/v1` evidence become an honest
package-level denominator without copying archives, treating one fixture as
compatibility breadth, or collapsing private optional routes into legal proof?

## Source-backed decision

- The corpus aggregates normalized journey references. It does not own ZIP
  payloads, sprite bytes, or browser captures.
- Availability is explicit: `required-legal`, `portable-legal`, or
  `optional-private`.
- Deterministic ordering and normalized fields are required for review and
  tamper detection. RFC 8785 documents canonical JSON as a standard reference,
  while the local checksum remains the repository's existing project-local
  stable-stringification convention and does not claim full JCS compliance.
- SPDX expressions remain source evidence, not a replacement for the existing
  `licenseVerified` and provenance checks.

## Implementation

- Added `CompatibilityCorpus/v0` input/result types, summary counts, route and
  unsupported-feature density, claim separation, and immutable output.
- Required/portable entries fail closed without a journey; optional private
  entries need an explicit unavailable reason.
- Duplicate entry/package identities, unverified licenses, empty claims, and
  checksum/status/summary drift are rejected.
- Serialized parsing validates the normalized payload directly and rejects
  tampered or non-canonical results.

## Evidence

- `CompatibilityCorpus.test.ts`: 3 focused tests passed.
- TypeScript 7 typecheck and `git diff --check`: passed.
- Broad suite: 210 test files / 2125 tests passed with
  `pnpm test -- --maxWorkers=4`.
- Build: 289 modules; existing large JavaScript chunk warning remains.
- Boundaries and CSS budget passed: 324085/536051 bytes, 1519/2364 rules,
  zero duplicate selector keys, zero exact duplicate rules, and zero shadowed
  cross-file rules.
- Trace gate: 600/600 artifacts passed, 566 required and 34 optional.
- Code commit: `8d33f126 feat: add compatibility corpus v0`.

## Claim ceiling

Allowed: a deterministic, legal-aware aggregation envelope over existing
journey evidence with explicit unsupported and unavailable density.

Blocked: broad public compatibility, score movement, commercial asset support,
automatic license adjudication, full ZIP/package corpus coverage, stage parity,
ZSS/Lua execution, rollback/netplay, and full MUGEN/IKEMEN parity.

## Next

Adjudicate the written score band against the generated corpus, then add one
independently legal stage or package route without bundling private assets.
