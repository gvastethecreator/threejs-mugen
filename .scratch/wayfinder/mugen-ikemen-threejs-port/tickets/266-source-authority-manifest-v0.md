# Ticket 266: SourceAuthorityManifest/v0

- Status: planned
- Date: 2026-07-18
- Scope: immutable identity for normative IKEMEN source, local cache, and
  file-level comparison
- Depends on: current source-pin audit and the existing PackageAnalysis v1
  upstream identity
- Research: [`docs/research/2026-07-18-source-authority-manifest-v0.md`](../../../../docs/research/2026-07-18-source-authority-manifest-v0.md)
- Source contract: official `ikemen-engine/Ikemen-GO` repository and the
  repository's recorded normative revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

How can the port record which upstream source a compatibility claim was
researched against, identify the local cache without exposing machine paths,
and prevent byte equality from being mistaken for semantic parity?

## Bounded contract

1. Add a versioned, canonical `SourceAuthorityManifest/v0` model under the
   compatibility boundary.
2. Require a full 40-character commit identity, repository URL, relative
   source paths, and SHA-256 file digests for the normative revision.
3. Record local-cache revision/state and derive a file-level delta without
   treating a dirty cache as clean.
4. Keep semantic review explicitly `unclassified` until a later pin-delta
   audit; equal file bytes alone must not authorize a semantic claim.
5. Reject malformed, duplicate, absolute, traversal, missing-digest, and
   tampered manifests deterministically.
6. Do not change runtime behavior or compatibility scores in this tranche.

## Acceptance evidence

- Focused tests cover deterministic creation, round-trip parsing, canonical
  ordering, missing normative identity, invalid paths/digests, dirty-cache
  state, file-delta derivation, semantic-review separation, and checksum
  tampering.
- TypeScript 7, repository boundaries, redirect boundary, and diff hygiene
  pass. Full suite/build are grouped with the next implementation checkpoint.
- Browser smoke is N/A because this is a compatibility metadata contract.

## Claim ceiling

This ticket permits reproducible source identity and file-level comparison
records only. It does not prove that the local cache matches the normative
revision, classify semantic deltas, execute ZSS/Lua/Modules, or claim broader
IKEMEN/MUGEN parity.
