# Wayfinder ticket 172: stateful BGCtrl motion

## Destination

Bring the bounded recognized stage motion controllers closer to the official
coordinate/velocity contract without introducing mutable renderer ownership.

## Decision

Resolve `velocity`, `VelSet`, `VelAdd`, `PosSet`, and `PosAdd` from the immutable
base layer at the requested background tick, in authored controller order and
with a loop-aware reset origin.

## Evidence

- Stage/parser focal gate: 2 files / 17 tests.
- TypeScript 7 typecheck passes.
- Initial velocity and one-axis `VelSet` behavior are explicit test oracles.

## Boundaries

Independent multi-group state, exact controller pause ordering, stage
zoom/window/mask/parallax parity, and full MUGEN/IKEMEN parity remain separate.

## Next

Run the accumulated stage quality gate before opening another compatibility
slice.
