# Ikemen `ModifyHitDef guard.sparkno` — T732

## Reference fixed

- Ikemen-GO pin `149402f`, `compiler_functions.go:1948-1951`: the compiler
  accepts the `guard.sparkno` HitDef sub-parameter and keeps its prefix/id
  representation.
- `bytecode.go:7670-7673`: the caller evaluates the live value.
- `char.go:11446-11450`: an accepted guard contact creates the guard spark
  from the active HitDef identity.

## Local gap

T731 now transports `guard.sparkangle` through the accepted guard event. The
local direct/Projectile/imported models already understand static guard spark
references, but live `ModifyHitDef` does not replace the active guard identity.

## Claim target

Root/RedirectID and Helper-owned live `ModifyHitDef guard.sparkno` with static
or caller-context dynamic values, omission preservation and guard-event
telemetry. The claim is Ikemen-only for the live controller path.

## Deferred

Fresh defaulting, hit spark identity, angle/offset/scale/palette/sound parity,
FightFX/common lookup, Projectiles, ModifyProjectile, renderer timing,
localcoord, teams, rollback and full parity.
