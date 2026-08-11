# Ikemen `ModifyHitDef guard.sparkno` — T732 closed-bounded

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

## Result

Implemented in `cbd226af` and promoted with `e883f7a7`. Static refs and
caller-context dynamic suffixes now replace the active guard identity while
retaining their `F`/`S`/`M` prefix; omitted or unresolved values preserve
the live ref. Focused compiler/runtime/Helper coverage passes, and required
trace `synthetic-imported-modifyhitdef-dynamic-guard-sparkno.json` passes with
trace checksum `e0f60aa3` and final checksum `00a1b557`, proving
`S7000 -> F19` with angle `-5`, offset `(-2,-3)`, and a guard-only
contact.

## Deferred

Fresh defaulting, hit spark identity, angle/offset/scale/palette/sound parity,
FightFX/common lookup, Projectiles, ModifyProjectile, renderer timing,
localcoord, teams, rollback and full parity.
