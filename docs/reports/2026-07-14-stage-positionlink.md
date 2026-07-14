# Report: stage positionlink

## Result

Entry 536 preserves authored `positionlink` relationships through import,
compatibility reporting, Studio inspection, and same-tick Three.js projection.
Linked layers inherit the target's resolved position and scroll delta, then
apply their authored offset.

## Implementation

- Added typed `MugenStageLayer.positionLink` metadata.
- Parsed linked groups against the last non-linked authored layer and retained
  the offset while inheriting the linked delta.
- Added cycle-safe target resolution in `resolveStageLayerForTick` so linked
  layers follow bounded target motion, visibility, animation offsets, and
  sinusoidal offsets without mutable stage state.
- Exposed the relationship in `StageCompatibilityReport` and Studio layer
  details.

## Verification

- Focal stage/parser/report gate: 3 files / 23 tests passed.
- TypeScript 7: `pnpm typecheck` passed after the final Studio formatting
  helper addition.
- Broad regression, build, trace, and browser gates remain deferred to the
  next accumulated stage checkpoint.

## Claim ceiling

This is bounded positionlink evidence, not exact full stage parity. Shared
mutable BGCtrl state across link groups, all-target controller order, parallax,
camera/window/mask behavior, and complete MUGEN/IKEMEN stage compatibility
remain open.

## Next

Run the accumulated stage quality gate after one more independent slice or
close the current stage batch if no higher-value bounded gap is ready.
