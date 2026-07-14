# Wayfinder 146 - Guard-points ownership

Type: task
Status: resolved bounded direct-combat/resource evidence
Blocked by: None

## Question

What guard-points route is safe after red-life and Helper-local resource
ownership without widening `RuntimeTeamResourceBank/v1` or projectile effects?

## Answer

Promote explicit direct `HitDef guardpoints` plus current-actor
`GuardPointsAdd`/`GuardPointsSet`. `[Data] guardpoints` initializes an
actor-local maximum with life fallback. Direct guarded contact preserves signed
point deltas through attack/defence scaling; controller writes clamp locally.
The required synthetic trace proves p2 `1000 -> 988` from guarded HitDef and
p1 `1000 -> 993 -> 900` through typed `GuardPointsAdd`/`GuardPointsSet` writes.

## Evidence

- Required trace: `synthetic-imported-guardpoints`.
- Focused tests: resource max/clamp/dynamic resolution, combat scaling,
  HitDef dispatch, and trace-gate evidence.
- Primary-source note: `docs/research/2026-07-14-guard-points-ownership.md`.
- Progress report: `docs/reports/2026-07-14-guard-points-ownership.md`.

## Claim boundary

Allowed: explicit direct guard points, actor-local initialization, signed
scaling, typed Add/Set, clamping, and trace evidence.

Blocked: omitted defaults, `NoGuardPointsDamage`, `AttackMulSet GuardPoints`,
`TargetGuardPointsAdd`, projectile/helper/team sharing, reset/persistence, HUD,
rollback/netplay, and full MUGEN/IKEMEN parity.
