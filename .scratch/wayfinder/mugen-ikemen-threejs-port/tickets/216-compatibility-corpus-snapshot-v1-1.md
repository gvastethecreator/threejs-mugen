# Harden CompatibilityCorpusSnapshot/v1.1

Type: task
Status: resolved
Blocked by: None

## Question

Can the tracked compatibility corpus snapshot prove that its evidence was
materialized for the expected source revision, within a declared freshness
window, and from files whose content still matches the recorded digest?

## Answer

Yes, for the current repository-owned journey route. The v1.1 contract carries
an injected `referenceAt`, a required `maxAgeHours`, an expected source
revision, and SHA-256 content digests. The materializer probes every indexed
passed artifact and fails closed on missing files, missing digests, digest
mismatch, stale observations, or source-revision mismatch.

## Boundaries

Included: v1.1 schema, live `git rev-parse HEAD` and ISO reference-time
injection, artifact probes, content-digest recording, external artifact
verification, and negative tests.

Deferred: a second first-party CC0 package/stage route, automatic license
adjudication, score movement, productive Studio consumption, and complete
MUGEN/IKEMEN parity.

## Evidence target

- Focused snapshot schema/materializer tests cover stable semantic identity,
  stale time, unexpected revision, missing file, and tampered digest paths.
- The tracked JSON is rebuilt through `pnpm materialize:compatibility-snapshot`
  from the live repository revision and real artifact files.
- TypeScript 7 and writer syntax checks remain green.

## Implementation result

- `CompatibilityCorpusSnapshot/v1.1` adds `referenceAt`, required freshness
  configuration, expected source revision, and optional recorded content
  digests.
- `materializeCompatibilityCorpusSnapshot` now requires an artifact probe;
  passed records receive a verified `sha256:<64 hex>` digest, while missing or
  altered files become unavailable/failed evidence.
- `verifyCompatibilityCorpusSnapshotArtifacts` rechecks an existing snapshot
  against current artifact content without changing its semantic identity.
- The writer injects the live Git revision and current reference timestamp.

## Verification

- Focused snapshot tests: `7/7` passed.
- `pnpm typecheck`: passed.
- `node --check scripts/materialize_compatibility_corpus_snapshot.cjs`: passed.
- `pnpm materialize:compatibility-snapshot`: passed and rewrote
  `docs/evidence/compatibility-corpus-snapshot-v1.json` as schema v1.1.
- Tracked artifact: 2 entries, 1 required legal journey, 1 unavailable
  optional-private entry, 5 passed artifact references with SHA-256 digests.
- No browser smoke was required because this slice changes evidence/runtime
  contracts and tests, not a visible renderer or Studio surface.

Claim ceiling: the repository-owned journey now has a revision- and
content-verified freshness record. This does not prove independent legal
breadth, stage compatibility, release readiness, score movement, or full
MUGEN/IKEMEN parity.
