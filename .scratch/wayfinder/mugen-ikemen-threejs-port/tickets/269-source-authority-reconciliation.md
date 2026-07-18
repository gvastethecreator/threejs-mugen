# Ticket 269: source authority reconciliation

- Status: resolved
- Date: 2026-07-18
- Scope: materialize selected normative/local IKEMEN source file digests without
  mutating either checkout
- Depends on: [T266](266-source-authority-manifest-v0.md)
- Research: [`docs/research/2026-07-18-source-authority-reconciliation.md`](../../../../docs/research/2026-07-18-source-authority-reconciliation.md)

## Question

How can the project produce a reproducible file-level delta between normative
IKEMEN revision `05b7d98...` and the local cache `044da720...`, including dirty
cache state, without hiding missing source objects or promoting byte changes to
semantic parity claims?

## Bounded contract

1. Add a Node materializer that reads Git objects from two explicitly supplied
   repositories and hashes a documented source-authority file set.
2. Read local working-tree bytes and Git status so untracked/modified paths
   force `dirty`, without changing the local cache.
3. Fail closed when the normative revision or required file cannot be read.
4. Write only a path-safe `SourceAuthorityManifest/v0` JSON artifact; never
   serialize machine paths or semantic conclusions.
5. Keep runtime behavior and compatibility scores unchanged.

## Acceptance evidence

- Official normative commit object is available in a separate audit clone.
- Materializer syntax and command pass against the real local cache plus the
  separate normative clone.
- Output parses through `parseSourceAuthorityManifest`, reports the selected
  same/changed file delta, and preserves dirty-cache incompleteness.
- The committed artifact is `docs/evidence/source-authority-manifest-v0.json`:
  normative `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, local
  `044da72008b8ba13caf7b0f820526ce16e955fb3`, cache `dirty`, comparison
  `changed`, three same files, six changed files, and semantic review
  `unclassified`.
- Implementation commit: `0d4a0274`.
- Focused parser/artifact coverage: `1` file / `7` tests passed. Materializer
  syntax, real materialization, missing-normative-root failure, TypeScript 7,
  module boundaries, and redirect-boundary checks passed.
- Browser smoke is N/A because this is a tooling/compatibility evidence slice.

## Claim ceiling

This ticket can prove source identity, selected file bytes, and cache dirtiness.
It cannot classify semantic changes, establish complete repository parity,
execute ZSS/Lua/Modules, or move MUGEN/IKEMEN compatibility scores.
