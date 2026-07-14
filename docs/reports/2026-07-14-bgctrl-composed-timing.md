# Report: composed BGCtrl timing

## Result

Entry 531 preserves the two independent reset sources in a stage background
controller: its explicit controller loop and the parent `BGCtrlDef` loop. The
projection clock now uses the most recent reset when both periods are present,
so a parent reset cannot leave a controller in a stale active window.

## Implementation

- Added optional `groupLoopTime` to `MugenStageBgCtrlTiming`.
- The DEF parser preserves the parent period beside the effective controller
  period.
- Stage projection handles non-equal controller/group periods deterministically.
- Stage compatibility data and the Studio controller row expose the composed
  timing without duplicating inherited values.

## Verification

- Focused stage/parser gate: 2 files / 15 tests passed.
- TypeScript 7 and broad gates are deferred to the next implementation batch.

## Claim ceiling

This closes the composed timing representation and boundary calculation only.
It does not move the compatibility score or claim full BGCtrl, stage, MUGEN, or
IKEMEN parity.

## Next

Continue with the next stage-runtime gap, prioritizing stateful controller
velocity/position behavior and `Enabled` animation-time pause semantics after
several implementation slices.
