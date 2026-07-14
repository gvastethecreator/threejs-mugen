# Research: Dizzy Points Suppression

## Decision

Implement `AssertSpecial NoDizzyPointsDamage` as a defender-owned, direct
`HitDef dizzypoints` suppression boundary. The flag does not suppress
`DizzyPointsAdd`/`DizzyPointsSet`, does not change guard contact, and does not
introduce team/helper/projectile sharing.

Official Ikemen-GO documentation states that while asserted, a player is not
affected by a HitDef's `dizzypoints` parameter: [State controllers (changed),
AssertSpecial flags](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#nodizzypointsdamage).

## Implementation Boundary

- `RuntimeAssertSpecial.noDizzyPointsDamage` is populated by the existing typed
  AssertSpecial executor.
- `resolveRuntimeCombatHit` omits only the direct-hit dizzy result when the
  defender flag is active.
- Auxiliary-resource projection reports dizzy suppression as bounded while
  red-life and guard-point suppression remain unimplemented.
- A required imported-vs-imported trace proves the flag executes before the
  direct HitDef and preserves the defender at `1000` dizzy points.

## Deferred

Positive omitted HitDef defaults, `AttackMulSet` `DizzyPoints`, dizzy-state
break transitions, red-life `LifeShare`, reset/persistence, HUD bars, and full
MUGEN/IKEMEN parity remain separate gates.
