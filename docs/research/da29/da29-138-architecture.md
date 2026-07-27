# DA29-138 architecture note

Wave 13

## Decision surface
Define input/clock/replay ports. Depends on DA29-021…030 and DA29-133.

## Acceptance
Ports expose deterministic frames, seat actions, clock domains, RNG, snapshot, and replay without CNS or team terms; fighting adapters preserve current traces.

## Constraints
Generic clock may omit fighting pause rules. Allows ports only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
