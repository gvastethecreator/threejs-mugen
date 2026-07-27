# DA29-189 architecture note

Wave 18

## Decision surface
Define install/offline cache and update recovery. Depends on DA29-123, DA29-181, and DA29-188.

## Acceptance
ADR/prototype covers service worker scope, immutable app assets, user projects, storage estimates, update prompt, old-version rollback, offline import/play limits, and cache purge.

## Constraints
Stale app code can open new project data. Allows offline architecture/prototype only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
