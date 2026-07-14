# Report: legacy stage vertical scale

## Result

Entry 537 preserves and projects the deprecated `yscalestart`/`yscaledelta`
stage fields used by official KFM-style fixtures. The path follows the
documented reciprocal vertical-scale formula and yields to authored general
scale fields when both contracts are present.

## Implementation

- Added optional legacy vertical scale fields to `MugenStageLayer`.
- Parsed and exposed them through the compatibility report and Studio layer
  detail string.
- Applied bounded reciprocal vertical scale in `resolveStageLayerScale`, with
  non-positive/singular values failing closed to zero geometry.
- Kept the existing exact-parallax gap visible in the report claim ceiling.

## Verification

- Focal stage/parser/report gate: 3 files / 25 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Broad regression, build, trace, and browser gates remain deferred to the
  next accumulated stage checkpoint.

## Claim ceiling

This is bounded legacy vertical scale evidence, not full parallax parity.
`xscale`, trapezoid deformation, camera anchors, window/mask behavior,
localcoord normalization, and complete MUGEN/IKEMEN stage compatibility remain
open.

## Next

Select the next independent runtime or Studio slice, then run the accumulated
stage quality gate before changing any score.
