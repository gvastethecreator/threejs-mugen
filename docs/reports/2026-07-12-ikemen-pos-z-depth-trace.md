# Ikemen Pos Z depth trace report

## Outcome

Required imported runtime evidence now proves logical Z changes direct-hit admission through playable `MatchWorld`.

## Scenario

- IKEMEN Tag roots P3/P4 are activated.
- P3 CNS executes `PosSet z=20` before its active root HitDef.
- P3/P4 still overlap in X/Y collision boxes.
- Logical attack/body depth ranges do not overlap.
- Root admission records `p3->p4` as `no-contact` for both frames.

## Evidence

- Required artifact: `synthetic-imported-ikemen-active-root-depth-miss`.
- Checksum: `7719d4ec`.
- Controllers: PosSet and HitDef.
- Operations: `kinematic:posset` and `hitdef`.
- Final P3/P4 life: 1000/1000.
- Targets: none.
- Forbidden combat reasons: hit, guard, override, reversal.
- Trace QA: 553/553 passed, 522 required.

## Boundary

This proves root Pos Z-driven direct HitDef rejection. It does not prove logical Z velocity, depth push/stage bounds, ReversalDef depth via imported trace, projectiles/helpers, or visual projection.
