# DA29-006 architecture note

Wave 0

## Decision surface
Replace split selector/cursor constants with one materialization input. Depends on DA29-001. Systems: materializers and evidence JSON.

## Acceptance
One checked schema generates both artifacts; changing a pin in a fixture changes both; stale DA27 constants are removed.

## Constraints
Generator forks can recur. Allows synchronized control artifacts only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
