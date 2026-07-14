# Report: stage layer scaling

## Result

Entry 535 adds a bounded stage layer scale path for `scalestart`, `scaledelta`,
and scalar-or-pair `zoomdelta`. Imported values now remain visible in the
stage compatibility report and Studio layer details.

## Implementation

- Added optional scale fields to `MugenStageLayer`.
- Parsed scale fields in `StageDefParser`, including one-value `zoomdelta`
  duplication across both axes.
- Added a pure `resolveStageLayerScale` helper used by sprite, asset, and
  placeholder rendering.
- Scaled sprite placements around their authored SFF axis and used resolved
  dimensions for tile spacing and bounded tile ranges.
- Added an explicit report warning for exact scale parity while keeping the
  bounded rendered layer status visible.

## Verification

- Focal stage/parser/report gate: 3 files / 21 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Broad regression, build, trace, and browser gates remain deferred to the
  next accumulated stage checkpoint.

## Claim ceiling

This is bounded scale evidence, not exact full stage parity. Legacy parallax,
window/mask zoom behavior, localcoord normalization, camera-anchor math, and
full MUGEN/IKEMEN stage compatibility remain open.

## Next

Accumulate the next independent stage or Studio slice, then run the broad
quality gate before any score movement.
