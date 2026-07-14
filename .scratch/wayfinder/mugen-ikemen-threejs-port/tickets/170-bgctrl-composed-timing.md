# Wayfinder ticket 170: composed BGCtrl timing

## Destination

Close the source-backed stage-controller clock gap without inflating the stage
compatibility claim.

## Decision

Preserve explicit controller `looptime` and parent `BGCtrlDef looptime` as
separate typed timing facts. Resolve the current local controller tick from the
most recent reset boundary when both are present.

## Evidence

- `StageDefParser` preserves both periods.
- `stageProjection` rejects stale active-window evaluation after a parent
  reset.
- Focused stage/parser verification passes 2 files / 15 tests.

## Boundaries

This is bounded timing evidence. Mutable velocity/position history, enabled
animation pause, stage zoom/window/mask semantics, pause ordering, and full
MUGEN/IKEMEN parity remain separate.

## Next

Select the next independent stage-runtime slice after the next batched quality
gate, with stateful controller motion as the leading candidate.
