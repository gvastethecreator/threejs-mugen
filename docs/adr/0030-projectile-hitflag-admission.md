# ADR 0030: explicit projectile HitFlag admission

- Status: accepted bounded
- Date: 2026-07-18
- Scope: static explicit `Projectile` and `ModifyProjectile` HitFlags
- Implementation: `f6990dff`

## Context

The Elecbyte controller reference defines Projectile as inheriting HitDef
parameters, including `hitflag`. The pinned IKEMEN source stores that HitDef
inside each projectile, applies the same HitFlag checks during projectile
contact, and permits ModifyProjectile to update the nested HitDef `hitflag`.
The sandbox already had the direct HitDef state/fall/minus/plus predicate, but
projectile IR, runtime state, mutation, snapshots, and player contact did not
share it.

## Decision

- Add static `hitFlag` to Projectile and ModifyProjectile typed operations.
- Store explicit values on live projectiles and expose them in effect
  snapshots.
- Apply the shared predicate to projectile/player contact before HitBy/NotHitBy
  and hit override handling, using the owning root runtime for attacker-side
  `NoFallHitFlag` semantics.
- Leave omitted fields undefined, preserving current behavior while default
  `MAF` inference remains a separate contract.
- Keep dynamic/string ModifyProjectile expressions outside this typed slice.

## Evidence

- [Elecbyte HitDef and Projectile reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
- [IKEMEN projectile contact loop](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L13493-L13538)
- [IKEMEN shared HitFlag checks](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10440-L10461)
- [IKEMEN ModifyProjectile HitFlag mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/bytecode.go#L8600-L8612)

## Consequences

Explicit static projectile HitFlags now have one observable, typed path from
controller input to contact admission. Omitted/default inference and dynamic
string evaluation remain visibly unsupported rather than being silently
treated as exact parity.

## Claim ceiling

This ADR accepts only bounded static projectile/player HitFlag admission. It
does not close defaults, reversals, clash ordering, exact projectile pause or
contact timing, `acttmp`/`hittmp`, custom-state breadth, or full parity.
