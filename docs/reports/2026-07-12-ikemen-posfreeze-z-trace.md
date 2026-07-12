# IKEMEN PosFreeze Z trace report

## Outcome

Required explicit-Tag evidence now proves full `PosFreeze` preserves root logical Z through the active-motion scheduler.

## Runtime route

1. P3 executes `VelSet z = 20` and full `PosFreeze` in active state 0.
2. Standing kinematics retains and decays Z velocity with the shared X/Z friction rule.
3. Active-root constraints restore logical Z to its tick-start position before stage clamp and hit admission.
4. Delayed `HitDef` reaches P4 at shared Z zero, causing 37 damage and one target link.

## Evidence

- Required artifact: `synthetic-imported-ikemen-active-root-posfreeze-depth`.
- Trace QA: 555/555 artifacts passed; 524 required.
- Actor telemetry: P3 logical Z position remains `0`; final Z velocity is `14.45` after two standing-friction passes.
- Combat: P4 life `1000 -> 963`; P3 target count `1`.
- Regression: 545 runtime trace preset tests passed after keeping additive Z telemetry outside the legacy checksum projection.

## Honest boundary

This proves root full-PosFreeze Z behavior for the exercised active Tag route. It does not prove bind Z, corner-push exceptions, pause/hitpause ordering, helpers/projectiles, stage depth bounds, visual depth projection, or complete MUGEN/IKEMEN parity.
