# DA29-048 architecture note

Wave 4

## Decision surface
Define atomic throw and custom-state ownership. Depends on DA29-041 and DA29-027.

## Acceptance
ADR covers target acquisition, state owner, position/bind, damage, release, interruption, KO, missing target, and rollback boundary with source refs.

## Constraints
Partial mutation can strand actors. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
