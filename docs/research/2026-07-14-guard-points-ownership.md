# Research - Guard-points ownership

Date: 2026-07-14
Status: source-backed bounded runtime decision

## Question

Which guard-points surfaces can follow red-life without widening the existing
life/power team bank or silently treating projectiles and Helpers as players?

## Primary evidence

- The official [IKEMEN-GO new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  defines `GuardPointsAdd` as an additive actor-local write and
  `GuardPointsSet` as an actor-local replacement.
- The official [IKEMEN-GO changed state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  defines `HitDef guardpoints`, its omitted-value multiplier path,
  `NoGuardPointsDamage`, and the separate `AttackMulSet GuardPoints` route.
- The official [IKEMEN-GO Character features reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features)
  defines `[Data] guardpoints` as the starting amount, defaulting to life, and
  exposes signed guard-point multiplier examples.

## Decision

Implement one bounded actor-local slice:

1. Parse explicit `HitDef guardpoints` values and carry them through direct
   guarded combat.
2. Preserve signed guard-point deltas through attack/defence scaling; this is
   required because the documented default multiplier can produce a negative
   value while the runtime stores remaining points.
3. Initialize each fighter from `[Data] guardpoints`, falling back to life,
   clamp `GuardPointsAdd`/`GuardPointsSet` to that actor-local maximum, and
   keep Helper state plumbing local without promoting team sharing.
4. Gate the route with a required synthetic imported trace proving guarded
   HitDef loss plus both typed resource controllers. Non-default values appear
   in trace evidence and behavior checksums.

## Uncertainty and boundary

The sources establish the controller and HitDef surfaces, not a complete
Three.js runtime. Omitted HitDef default formulas, `NoGuardPointsDamage`,
`AttackMulSet GuardPoints`, `TargetGuardPointsAdd`, projectile inheritance,
custom Helper maxima, team-bank sharing, reset/persistence, rollback, HUD
bars, and full MUGEN/IKEMEN parity remain blocked and are not claimed.
