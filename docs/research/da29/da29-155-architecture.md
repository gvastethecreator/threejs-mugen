# DA29-155 architecture note

Wave 15

## Decision surface
Define AI input and decision ownership. Depends on DA29-021, DA29-028, and DA29-151.

## Acceptance
ADR separates authored CNS AI logic, engine-controlled inputs, difficulty, deterministic RNG, observation, reaction delay, pause, replay, and user override.

## Constraints
Hidden AI cheats or replay drift. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
