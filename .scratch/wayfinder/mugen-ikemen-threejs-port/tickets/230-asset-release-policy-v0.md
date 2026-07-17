# Implement AssetReleasePolicy/v0 and one releaseable record

Type: task
Status: resolved
Blocked by: Wayfinder 229
Date: 2026-07-16

## Question

Can Studio keep immutable asset provenance separate from a fail-closed release
decision, while allowing diagnostic export for records that are incomplete or
stale?

## Answer

Yes, at bounded scope. `AssetReleasePolicy/v0` is a separate decision record
over permission, license, input/output digest, ordered transform, QA,
collision, and playtest evidence. Missing, failing, unknown, stale, or
non-fresh required evidence blocks release. A warning is retained when the
required kind also has a passing check; this preserves the known Nova motion
warning without hiding it.

Nova Boxer is the only releaseable record after the real ZIP joins actual
bundled hashes and a fresh matching runtime trace. Imported KFM, Mira, Rook,
and stage records remain diagnostic-only. Export remains available, but the
policy artifact marks those records blocked.

## Evidence

- `src/app/StudioAssetReleasePolicy.ts`: schema, required kinds, freshness,
  canonical ordering, fail-closed blockers, and diagnostic eligibility.
- `src/tests/StudioAssetReleasePolicy.test.ts`: 3 tests / 3 cases covering
  ready-with-warning, missing/stale/unknown blocking, unsafe paths, and
  incomplete transforms.
- `scripts/qa_smoke.cjs`: browser bridge, ZIP manifest, policy record, path,
  and release-readiness assertions.
- Final browser smoke: passed in 398.9s, 0 page errors, 0 console issues;
  Nova `ready`/`canRelease: true`, 1 ready record, 9 diagnostic-only records.
- Final package inspection: policy schema is present in the ZIP, Nova has
  permission/license/digest/transform/QA/collision/playtest evidence, and no
  policy path violations.

## Claim ceiling

This is a repository-owned/generated fixture decision. It is not legal
approval, third-party or commercial authorization, imported MUGEN credit,
IKEMEN execution, or full parity.

## Next

Define `EvidenceContract/v0` only after the current policy record remains
revision-bound and its fresh artifact inputs can be consumed by the shared
Studio evidence surface.
