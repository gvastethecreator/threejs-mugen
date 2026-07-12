# Ikemen Vel Z depth trace report

## Outcome

Required imported evidence proves logical Z velocity reaches direct-hit admission through the normal playable scheduler.

## Sequence

1. P3 active CNS executes `VelSet z=20` at Time 0.
2. First admission has no P3 HitDef and records `missing-move`.
3. Normal kinematics advances P3 logical position Z by 20.
4. Delayed HitDef activates at Time >= 1.
5. Subsequent admissions record P3->P4 `no-contact` despite X/Y Clsn overlap.

## Evidence

- Required artifact: `synthetic-imported-ikemen-active-root-depth-velocity`.
- Checksum: `6cf14866`.
- Trace QA: 554/554 passed, 523 required.
- Final P3/P4 life: 1000/1000.
- Targets and combat reasons: none.

## Boundary

This proves root Vel Z authoring and integration. S/C friction, PosFreeze/bind Z, hit velocity Z, depth bounds/push, ReversalDef/projectile/helper routes, and render projection remain pending.
