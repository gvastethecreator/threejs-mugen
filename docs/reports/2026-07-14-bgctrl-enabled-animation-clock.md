# Report: BGCtrl Enabled animation clock

## Result

Entry 532 makes the stage renderer stop advancing action-backed animation while
an active `Enabled = 0` controller disables its target layer. Re-enabling the
layer resumes from the number of enabled background ticks; `Visible` remains a
visual hide that does not pause the clock.

## Implementation

- Added runtime-only `animationTick` to resolved stage layers.
- Counted enabled ticks for targeted `Enabled` controllers.
- Routed `AxisRenderer` action lookup through the resolved animation clock.
- Added focal stage projection coverage for pause and resume boundaries.

## Verification

- Focal stage projection gate: 1 file / 12 tests passed.
- TypeScript 7 and broad gates remain deferred to the next implementation
  batch, per the batched verification cadence.

## Claim ceiling

This is bounded action-clock evidence, not full `BGCtrl`, stage, MUGEN, or
IKEMEN parity. The current counter is intentionally simple and does not yet
model every mutable controller interaction.

## Next

Continue with stateful `VelSet`/`VelAdd`/`PosAdd` motion after the next related
stage slice, then run the accumulated TypeScript and regression gates.
