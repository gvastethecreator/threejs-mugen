# DA28-06 live projectile schedule

Date: 2026-07-26  
Status: closed-bounded  
Depends on: DA28-02

## What landed

- `LiveGlobalProjectileSchedule/v1` gathers live `RuntimeProjectile` actors into
  `GlobalProjectileSchedule` work items (priority, age-derived spawn tick, side,
  serial-derived localSeq).
- `RuntimeEffectActorWorld.resolveProjectileCombat` and
  `resolveProjectileClashes` order projectiles through the live schedule before
  combat/clash resolution.
- `scheduleProjectilesForOwner` retains the last schedule for diagnostics.

## Evidence

| Gate | Result |
| --- | --- |
| Unit `LiveGlobalProjectileSchedule.test.ts` | multi-owner order, reverse-insertion stability, helper-owned subjects, EffectActorWorld schedule wire |
| Existing projectile/effect suites | green |

## Claim ceiling

Allowed:

- Live combat path uses a stable global projectile order for a given multiset
- Insertion order and owner-side list order alone do not flip equal-key ties

Blocked:

- Full plural projectile parity with Ikemen
- Pause/restore/replacement live browser matrix (later DA28 tasks)
- Score movement
