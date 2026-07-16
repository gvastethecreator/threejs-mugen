# Research: IKEMEN projectile depth Z runtime

Date: 2026-07-16
Status: selected for implementation (Wayfinder 211)

## Primary-source findings

The official IKEMEN GO runtime stores projectile position and velocity as
three-component values. The Projectile controller accepts a three-component
`offset`; projectile movement advances X, Y, and Z independently. The projectile
also has a depth bound used for removal, which is separate from collision
admission and is intentionally deferred in this slice.

`HitDef.attack_depth` is present on projectile HitDef state. Its default is the
owning character's `size.attack.depth`, while `size.proj.attack.dist.depth`
feeds projectile guard-distance defaults. Character and attack depth constants
are multiplied by the local-coordinate ratio during character setup.

The official direct projectile/player path checks Z overlap with the projectile
attack depth against the defender body depth before the current collision-box
check. The `HitFlag = P` cancellation path checks the defender HitDef attack
depth against the projectile attack depth. The projectile trade path checks
projectile attack depth against projectile attack depth before strict current
frame Clsn2 overlap.

The official helper is equivalent to inclusive interval overlap after each side
is scaled into stage depth units:

```text
(pos1 + bottom1) * localScale1 >= (pos2 - top2) * localScale2
and
(pos1 - top1) * localScale1 <= (pos2 + bottom2) * localScale2
```

Official references:

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/system.go)
- [IKEMEN controller compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/compiler_functions.go)
- [IKEMEN changed controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)

## Port decision

Carry optional projectile `pos.z` and `velocity.z` without changing the shape
of legacy XY fixtures. Carry the projectile localcoord and an explicit or
default attack-depth pair. When the Z values are absent, the runtime treats the
projectile as positioned at zero with the default attack depth, preserving
existing behavior for fixtures that have no depth data.

Use `hasRuntimeCombatDepthContact` for all three covered routes. The player
route compares projectile attack depth to defender body depth; HitFlag P
compares the defending HitDef attack depth to projectile attack depth; trade
compares both projectile attack-depth ranges. Missing depth metadata remains
permissive at the existing compatibility boundary, while supplied ranges are
strict and inclusive.

## Boundaries

Included: projectile compiler lowering, root/player spawn propagation, Z
movement, local-coordinate scaling, projectile/player admission, HitFlag P
admission, and projectile trade admission.

Deferred: proxy flattening, helper-owned Z state, exact depth-bound removal,
perspective/render ordering, exact cancel tick order, rollback/netplay, score,
and complete upstream parity.

## Implementation evidence

Pending Wayfinder 211 implementation.

