# DA29-061 architecture note

Wave 6

## Decision surface
Define explicit team-mode domain contracts. Depends on DA29-009 and DA29-050.

## Acceptance
Single, Simul, Turns, and Tag contracts name roster, active members, input seats, life/power policy, KO, round transition, camera, HUD, and profile limits.

## Constraints
One shared model may erase mode rules. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
