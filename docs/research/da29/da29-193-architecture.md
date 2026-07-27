# DA29-193 architecture note

Wave 19

## Decision surface
Define plugin capability and trust boundaries. Depends on DA29-175, DA29-192, and DA29-146.

## Acceptance
Contract covers install source, manifest, permissions, isolation, host APIs, versioning, revocation, update, data access, UI surfaces, resource caps, and evidence.

## Constraints
Plugins widen security and support load. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
