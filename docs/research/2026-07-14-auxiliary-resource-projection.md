# Research - Auxiliary resource projection

Date: 2026-07-14
Status: source-backed bounded runtime decision

## Question

How can the runtime publish red-life, guard-point, and dizzy-point ownership
without widening the life/power team bank or implying that a HUD projection is
resource execution?

## Primary evidence

- The official [IKEMEN-GO new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  keeps `GuardPointsAdd`/`GuardPointsSet` and `DizzyPointsAdd`/`DizzyPointsSet`
  as separate controller families.
- The official [IKEMEN-GO changed state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  documents independent HitDef guard-point behavior, suppression, and attack
  multiplier routes rather than a generic life/power resource map.
- The official [IKEMEN-GO character features reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features)
  describes guard and dizzy points as character data with their own starting
  values and maxima, while the existing pinned-source audit records red-life
  mirroring as a separate LifeShare family.

## Decision

Publish `RuntimeAuxiliaryResourceProjection/v0` as a read-only snapshot and
trace contract. Each root and live Helper gets an explicit resource owner id,
root/parent identity, side, team state, and three resource slots:

- red life: available, actor-local in the current route, with root LifeShare
  marked as deferred policy;
- guard points: available, actor-local, with the authored maximum or life
  fallback already owned by the runtime;
- dizzy points: explicit actor-local ownership, but `unimplemented` until its
  state initialization and mutation route land.

The projection also records that suppression semantics are not implemented and
excludes Projectile/Explod actors. Invalid maxima and values normalize to
finite bounded output and retain stable diagnostics. The projection is copied
through `MugenSnapshot` and `RuntimeTrace` outside behavior checksums.

## Acceptance

- root and Helper ordering is deterministic;
- invalid/max values are diagnosed and clamped without mutating source state;
- explicit IKEMEN snapshots expose the projection while legacy/unknown
  snapshots remain unchanged;
- the life/power team bank and team lifebar contracts remain untouched;
- projectiles and explods cannot become auxiliary-resource owners by inference;
- no behavior checksum changes are introduced by the read-only projection.

## Claim boundary

Allowed: read-only ownership/identity projection, root/Helper inclusion,
guard/red-life value projection, maxima diagnostics, explicit dizzy-point
unavailability, and checksum isolation.

Blocked: dizzy initialization/mutation/break state, red-life LifeShare mutation,
suppression flags, omitted HitDef defaults, projectile/team sharing, HUD bars,
reset/persistence, rollback/netplay, and full MUGEN/IKEMEN parity.
