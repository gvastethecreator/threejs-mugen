# Issue 258 — live ModifyProjectile down.velocity dynamic replacement

- Status: `source-mapped`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next Projectile vector gap after T683: evaluate live
`ModifyProjectile down.velocity` expressions once in the original caller
context, broadcast the selected component replacement to matching live
Projectiles, and prove a later lying hit consumes the changed vector.

## Source gate

The pinned Ikemen `ModifyProjectile` path reuses the Projectile HitDef
parameter set, evaluates the selected `down.velocity` components in the
controller caller, and writes the result to every selected Projectile. The
fresh Projectile inheritance/default chain from T683 does not rerun during
mutation; omitted components therefore preserve the live vector, while the
one-component form follows the pinned ModifyProjectile write semantics.

Sources:

- Ikemen `149402f`: `bytecode.go:8405-8410,9153-9165`
- Ikemen `149402f`: `compiler_functions.go:2558-2575`
- Ikemen `149402f`: `bytecode.go:7627-7634` (component evaluation/write)
- Ikemen `149402f`: `char.go:10403-10407,10980-10984,11201-11203`
- M.U.G.E.N 1.1: Projectile inherits the HitDef `down.velocity` parameter;
  `ModifyProjectile` is Ikemen-only and must not be called M.U.G.E.N parity.

## Bounded acceptance proposal

- Root-owned live Projectiles selected by `ModifyProjectile` accept finite
  static/dynamic `down.velocity` components in caller context.
- A one-component mutation replaces X and preserves live Y/Z; a pair replaces
  X/Y and preserves Z; a full triple replaces all three components. Omission is
  a no-op for the live vector.
- A later accepted lying hit exposes the mutated vector through Projectile
  physics, contact metadata, `GetHitVar`, target memory, and Projectile
  lifecycle evidence.
- Keep selected-id broadcast and existing remove/hit-count behavior unchanged.

## Explicit exclusions

Helper-owned `ModifyProjectile`, dynamic `n`, fresh default/inheritance
recalculation, air/airguard/ground vector selection, exact tick/landing order,
localcoord/facing edge cases, nested/team topology, rollback, and full
M.U.G.E.N/Ikemen Projectile parity.

## Next implementation step

Add typed `ModifyProjectile down.velocity` expression fields and a caller
resolver that mutates the selected live Projectile component-wise. Add focused
compiler/runtime coverage, one root-owner lying-hit trace, then reassess the
Helper-owned breadth as a separate cut.
