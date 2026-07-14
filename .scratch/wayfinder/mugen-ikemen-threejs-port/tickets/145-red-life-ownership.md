# Wayfinder 145 - Red-life ownership

Type: task
Status: resolved bounded direct-combat/resource evidence
Blocked by: None

## Question

What red-life slice is safe to promote after helper-local resource ownership
without silently widening team banks or projectile resources?

## Answer

Promote explicit direct `HitDef redlife = hit, guard` values and current-actor
`RedLifeAdd`/`RedLifeSet`. Direct contact scales explicit red life through the
same attack/defence projections as its damage, while controller additions use
the current actor defence unless `absolute=1`. State is actor-local and capped
by life maximum. Zero red life stays out of the behavior checksum; positive
values are visible to trace gates.

## Evidence

- Required trace: `synthetic-imported-redlife`.
- Focused tests: resource mutation/resolution, combat hit/guard scaling, and
  trace gate evidence.
- Official sources are recorded in
  `docs/research/2026-07-14-red-life-ownership.md`.

## Claim boundary

Allowed: explicit direct HitDef red life and actor-local RedLifeAdd/Set.

Blocked: implicit default multipliers, NoRedLifeDamage, AttackMulSet RedLife,
TargetRedLifeAdd, projectile/helper/team sharing, persistence, rollback,
lifebar presentation, and full parity.
