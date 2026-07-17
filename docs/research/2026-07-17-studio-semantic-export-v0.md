# Research: Studio Semantic Export/v0

Date: 2026-07-17
Question: What must the Studio export contract separate and validate so that
reopened diagnostic artifacts compare semantically without changing when only
observation time changes?

## Answer

Use two identities. The semantic identity excludes observation time and covers
the versioned project/evidence/decision payload. The transport identity includes
observation time and protects the exact exported document. This matches the
repo's T09 acceptance while avoiding a release or signing claim.

## Primary sources

- [RFC 8785: JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html)
  explains why hashing/signing needs invariant representation, recursively
  sorted object properties, and preserved array order. The local contract uses
  the same bounded intent but is not advertised as RFC 8785/JCS-conformant.
- [ECMAScript 2026, JSON.stringify](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json.stringify)
  defines JSON serialization behavior. Ordinary JSON serialization alone is
  not the Studio semantic contract, so the implementation uses a local stable
  serializer that sorts object keys and omits undefined values.
- [Roadmap architecture audit, T09](./2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md)
  fixes the acceptance boundary: versioned decision, evidence identities,
  project revision, blockers, next action, observation-time-independent
  semantic digest, two-build determinism, tamper, bundle, and reopen proof.

## Findings

1. `ProjectReleaseDecision/v0` already owns normalized evidence ordering,
   deterministic blockers, diagnostic/release intent separation, and next
   action selection. T09 should project that contract, not recalculate release
   policy or claim package reanalysis.
2. `generatedAt` belongs to the transport envelope only. Keeping it out of the
   semantic payload makes two observations of the same decision compare equal;
   retaining it in the full payload makes the exported document auditable.
3. Arrays are semantic data. Evidence and blocker order comes from the source
   decision's normalization; the local serializer sorts object keys but does
   not reorder arrays.
4. Parse validation must check both digest layers. A changed semantic field must
   fail the semantic digest; a changed timestamp or full-payload digest must
   fail the transport digest.
5. The local `fnv1a32` value is suitable for deterministic identity and focused
   tamper detection in this browser artifact. It is not a cryptographic hash,
   signature, authenticity proof, or public-release authorization.

## Decision impact

`StudioSemanticExport/v0` is implemented in
`src/app/StudioSemanticExport.ts`, exposed through the Studio bridge and
Evidence/Build/Trust Chain, and required in the project ZIP. T09 is closed by
`24b87108`. T27 may later consume its stable identity when PackageAnalysis
reanalysis/diff is implemented, but T09 does not pre-implement that workflow.

## Remaining uncertainty

If the artifact later becomes a cross-runtime signed interchange format, the
local serializer should be replaced or profiled against a fully specified
canonicalization scheme, including number and Unicode handling. That is outside
the current local Studio diagnostic boundary.
