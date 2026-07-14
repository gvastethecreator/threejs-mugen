# Wayfinder ticket 171: BGCtrl Enabled animation clock

## Destination

Make the bounded stage action path respect the official distinction between
visual visibility and animation-time advancement.

## Decision

Resolved layers with targeted `Enabled` controllers publish a runtime-only
`animationTick` based on enabled background ticks. `AxisRenderer` uses that
clock for action-backed stage frames; `Visible` does not pause it.

## Evidence

- Stage projection focal gate passes 1 file / 12 tests.
- Pause boundary is covered at the first disabled tick and after re-enable.

## Boundaries

Mutable controller velocity/position history, multi-group state ordering,
zoom/window/mask behavior, and full MUGEN/IKEMEN stage parity remain separate.

## Next

Implement the next bounded stateful motion slice, then run the accumulated
quality gate.
