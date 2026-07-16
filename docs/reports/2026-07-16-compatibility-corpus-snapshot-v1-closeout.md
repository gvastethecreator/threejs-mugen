# CompatibilityCorpusSnapshot/v1 closeout

Date: 2026-07-16
Wayfinder ticket: 199

## Task state

Completed for the schema and repository-owned baseline materialization.

## Artifact verdict

Pass against the snapshot acceptance target. `CompatibilityCorpusSnapshot/v1`
now separates semantic identity from observation metadata, carries exact
package/route/unsupported/artifact references, validates freshness, and
materializes one current repository-owned legal journey.

## Delivered

- Added `src/mugen/compatibility/CompatibilityCorpusSnapshot.ts`.
- Added `semanticDigest` over canonical semantic content without `observedAt`.
- Kept `checksum` over the complete serialized envelope, including
  `observedAt`, for transport tamper detection.
- Added source revision, tool/ruleset identity, freshness policy, package
  license/provenance/entry identity, route ids, unsupported ids, and artifact
  paths/checksums.
- Added a materializer from `CompatibilityCorpus/v0` plus package/artifact
  catalogs. Missing required records become `unavailable` and fail closed.
- Added `docs/evidence/compatibility-corpus-snapshot-v1.json` and the
  `materialize:compatibility-snapshot` command.

## Evidence

- Snapshot semantic digest: `b288c845`.
- Snapshot transport checksum: `63598806`.
- Snapshot contents: 2 entries, 1 required legal journey, 1 optional-private
  stage entry explicitly unavailable, 11 route ids, 5 required artifact
  references, 1 intentional unsupported controller finding.
- Focused contracts/materializer: `15/15` tests passed.
- TypeScript 7 typecheck: passed.
- Materializer command: passed and rewrote the checked JSON artifact.
- Writer syntax: `node --check scripts/materialize_compatibility_corpus_snapshot.cjs` passed.
- `git diff --check`: passed for the feature files.

## Freshness and scope

The materializer verifies catalog status and required artifact identity, then
records the observation timestamp. It does not silently treat ignored
`.scratch` payloads as a portable corpus. The official Training Room stage
remains an explicit optional-private `unavailable` entry because a fresh
machine-readable stage journey record is not committed by this slice.

Allowed: a reproducible evidence denominator for the repository-owned legal
MUGEN Lite journey and its current runtime/browser/native references.

Blocked: independent legal breadth, stage parity, commercial redistribution,
automatic license adjudication, exact Common1 timing, score movement, and
full MUGEN/IKEMEN parity.

## Quality audit

The adversarial cases cover changed observation time, tampered semantic digest,
tampered transport checksum, missing required artifacts, and duplicate
artifact identities. Independent review was omitted; the contract received a
manual source/diff audit plus focused failure-path tests. No visible UI or
renderer surface changed, so browser smoke is N/A for this slice.

## Commits

- `f8dc53b5 feat(compatibility): add corpus snapshot v1 contract`
- `63768392 test(compatibility): cover corpus snapshot rebuilds`
- `22addeef test(compatibility): materialize corpus snapshot baseline`

## Next frontier

Create a fresh machine-readable stage journey input or independently legal
package route, then characterize the four existing RedirectID caller/dest-
ination paths before accepting ADR 0006 or widening `TargetScoreAdd`.
