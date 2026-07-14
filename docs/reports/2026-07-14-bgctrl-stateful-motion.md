# Report: stateful BGCtrl motion

## Result

Entry 533 upgrades the recognized stage motion path from independent per-
controller offsets to a bounded authored-order motion pass. Imported initial
velocity is retained, `VelSet` updates only authored axes, `VelAdd` accumulates,
`PosSet` assigns coordinates, `PosAdd` displaces them, and velocity integrates
once per background tick.

## Implementation

- Added `MugenStageLayer.velocity` parsing and report projection.
- Added a pure stage motion resolver with loop-aware reset origin.
- Routed motion controller types through the stateful resolver and kept
  visibility, animation selection, and sinusoidal controllers in the existing
  presentation pass.
- Preserved the existing stage coordinate contract for sprite and placeholder
  layers.

## Verification

- Focused stage/parser gate: 2 files / 17 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Broad regression, build, trace, and browser gates remain deferred until the
  next accumulated stage batch.

## Claim ceiling

This is bounded stateful motion evidence, not exact full BGCtrl or stage parity.
Multiple independent controller groups, exact pause ordering, zoom/window/mask
semantics, and complete MUGEN/IKEMEN behavior remain open.

## Next

Run the accumulated stage quality gate, then select the next independent stage
or runtime compatibility slice.
