# ADR 0035: Source Authority Reconciliation

## Status

Accepted for bounded evidence tooling. 2026-07-18.

## Context

`SourceAuthorityManifest/v0` defines normative/local source identity, but
identity alone does not prove that a selected local checkout contains the
selected upstream bytes. The local IKEMEN cache can also be dirty, so a
revision comparison must not hide working-tree files.

## Decision

Materialize a fixed, documented set of nine IKEMEN `src/*.go` files from two
explicit Git roots:

- normative Git blobs at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`;
- local working-tree bytes at revision
  `044da72008b8ba13caf7b0f820526ce16e955fb3`.

The Node materializer records SHA-256 file digests, local `git status`, and a
path-safe `docs/evidence/source-authority-manifest-v0.json` artifact. Missing
Git roots, revisions, blobs, or invalid paths fail closed. The materializer
does not mutate either checkout and never assigns semantic meaning to a byte
delta.

`comparison = changed` means selected bytes differ. A dirty local cache keeps
the comparison incomplete for reproducibility. `semanticReview` remains
`unclassified` until a separate source-aware semantic audit is completed.

## Consequences

The project now has reproducible transport-level evidence for the selected
source files and an explicit dirty-cache boundary. The artifact does not
claim repository-wide parity, semantic equivalence, ZSS/Lua parity, or runtime
execution. Compatibility scores remain unchanged.

## Evidence

- Implementation: `scripts/materialize_source_authority_manifest.cjs`.
- Artifact: `docs/evidence/source-authority-manifest-v0.json`.
- Tests: `src/tests/SourceAuthorityManifest.test.ts`.
- Commit: `0d4a0274`.
