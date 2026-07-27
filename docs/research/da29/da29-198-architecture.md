# DA29-198 architecture note

Wave 19

## Decision surface
Design hosted-preview deployment and rollback. Depends on DA29-146…148, DA29-188, and DA29-197.

## Acceptance
Architecture covers static hosting, headers/CSP, cache keys, asset limits, privacy, artifact promotion, smoke, rollback, status, and domain/secret authority; no deployment occurs.

## Constraints
Local readiness differs from production. Allows deployment plan only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
