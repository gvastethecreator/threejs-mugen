# IKEMEN target binding Z report

## Outcome

Target binding memory now carries optional logical Z in both directions.

## Supported

- `TargetBind pos = x,y,z` typed lowering and raw fallback.
- `BindToTarget posz = z` typed lowering and raw fallback.
- Immediate logical-Z placement.
- Multi-tick binding maintenance.
- Per-side localcoord conversion.
- Snapshot and target-link evidence with `bindingOffsetZ`.

## Required evidence

- `synthetic-imported-targetbind-depth`: P2 remains at owner-relative Z `15`.
- `synthetic-imported-bindtotarget-depth`: P1 remains at target-relative Z `12`.
- Trace QA: 557/557 artifacts, 526 required.
- Regression: 1863 tests plus typecheck/build/boundaries.

## Blocked claims

No helper/projectile bind-Z trace, pause/hitpause Z ordering, stage depth bounds/push, visual projection, or full MUGEN/IKEMEN parity claim.
