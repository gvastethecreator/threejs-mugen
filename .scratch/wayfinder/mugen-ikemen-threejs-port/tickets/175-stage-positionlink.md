# Wayfinder ticket 175: stage positionlink

## Destination

Preserve official linked background relationships from DEF import through
compatibility reporting, Studio details, and the Three.js stage projection.

## Decision

Store the typed target id and authored offset. Resolve the target at the same
background tick with a cycle guard, inherit its resolved position/delta, then
apply the child offset and child controllers.

## Evidence

- Stage/parser/report focal gate: 3 files / 23 tests.
- TypeScript 7 typecheck passes after the final Studio detail helper.
- Official Elecbyte and IKEMEN-GO references are recorded in
  `docs/research/2026-07-14-stage-positionlink.md`.

## Boundaries

Exact shared mutable controller state, all-target ordering, parallax geometry,
camera/window/mask behavior, and full MUGEN/IKEMEN parity remain separate.

## Next

Rerun the accumulated stage quality gate before closing this batch.
