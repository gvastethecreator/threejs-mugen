# Research: CompatibilityCorpusSnapshot/v1.1

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 216

## Question

What minimum producer and schema changes are needed before a tracked
`CompatibilityCorpusSnapshot` can be used as a fresh evidence denominator?

## Baseline finding

The v1 producer stored a historical source revision and only copied artifact
status/path/checksum records from a catalog. The contract had no injected
reference clock, no expected revision comparison, and no content probe. A
valid envelope could therefore be internally consistent while pointing at a
missing, changed, or stale file.

## Decision

Keep semantic identity separate from observation metadata. v1.1 records the
source revision and expected revision in the semantic payload, while
`observedAt` and `referenceAt` remain transport/freshness metadata. The
materializer receives an artifact probe that reports existence and a
`sha256:<64 hex>` digest. Every passed evidence record is probed; a missing
file becomes `unavailable`, a missing probe digest becomes `failed`, and a
catalog digest mismatch becomes `failed`. Required entries or freshness
artifacts that are not passed fail the snapshot.

The separate verifier repeats the file probe for an existing snapshot. This
keeps parser integrity and filesystem freshness as distinct checks instead of
pretending that JSON checksum validation proves the referenced file still
exists.

## Source basis

- The local post-Wayfinder-209 audit defines T04 as live source revision,
  reference time, max-age, expected revision, and referenced-artifact digest
  enforcement: `docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.
- The existing v1 research keeps semantic digest independent from
  `observedAt`: `docs/research/2026-07-16-compatibility-corpus-snapshot-v1.md`.
- [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html)
  is the primary serialization reference for deterministic hashed JSON. The
  repository continues to use its own stable serializer and does not claim
  JCS conformance.
- [Git `rev-parse` documentation](https://git-scm.com/docs/git-rev-parse)
  documents the command used by the producer to inject the current revision.

## Acceptance mapping

| Requirement | Evidence |
| --- | --- |
| Live source revision | Writer injects `git rev-parse HEAD`; snapshot records it and requires the same expected revision. |
| Reference time and max age | v1.1 carries `referenceAt` and requires a positive `maxAgeHours`; stale/clock-inverted records fail. |
| Existing referenced files | The materializer probe returns `exists`; missing files cannot remain passed. |
| Matching content digests | Probe SHA-256 is recorded and compared with any catalog digest; the standalone verifier detects later drift. |
| Stable semantic identity | `observedAt` and `referenceAt` are outside the semantic payload; tests cover observation/reference changes. |
| Negative matrix | Focused tests cover stale, unexpected revision, missing file, and tampered digest. |

## Claim boundary

Allowed: a revision- and content-verified snapshot for the existing
repository-authored journey route when the materializer and artifact files
pass together.

Blocked: independent legal package breadth, stage/package diversity, license
adjudication, browser freshness beyond the recorded file digest, score
movement, and complete MUGEN/IKEMEN compatibility.
