# Research - Red-life ownership

Date: 2026-07-14
Status: source-backed bounded runtime decision

## Question

Which red-life surfaces can be added without confusing direct combat damage,
actor-local resource controllers, team banks, or projectile ownership?

## Primary evidence

- The official [IKEMEN-GO Character features reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features)
  defines the red-life multiplier constants used when a HitDef omits an
  explicit red-life value.
- The official [IKEMEN-GO changed state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  documents `HitDef redlife = hit_value, guard_value` and the
  `NoRedLifeDamage` exception surface.
- The official [IKEMEN-GO new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  documents `RedLifeAdd` with optional `absolute` scaling and `RedLifeSet` as
  distinct controller writes. `TargetRedLifeAdd` is a separate target-owned
  surface.
- The [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  remains the MUGEN baseline for the controller family; it does not establish
  the IKEMEN red-life extensions.

## Decision

Implement one bounded actor-local slice:

1. Parse explicit `HitDef redlife = hit, guard` values.
2. Carry explicit hit/guard red life through direct root combat with the same
   attack/defence multipliers as the corresponding contact, then apply the
   result to the defender's local red-life value.
3. Compile and execute `RedLifeAdd` and `RedLifeSet` on the current actor.
   Non-absolute `RedLifeAdd` uses the current defence projection; `absolute=1`
   bypasses that projection. Values are clamped to the actor life maximum.
4. Expose positive red-life changes in trace actor-frame/final evidence while
   omitting zero values from the behavior checksum to preserve prior golden
   checksums.

## Uncertainty and boundary

The official references support the surfaces above but do not make the current
runtime a full IKEMEN VM. Omitted HitDef default red-life formulas,
`NoRedLifeDamage`, `AttackMulSet RedLife`, `TargetRedLifeAdd`, projectile and
helper red-life ownership, team-bank sharing, round persistence, rollback, and
UI/lifebar presentation remain blocked and are not claimed by this slice.
