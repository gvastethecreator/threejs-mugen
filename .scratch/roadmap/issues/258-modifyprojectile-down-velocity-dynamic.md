# Issue 258 — live ModifyProjectile down.velocity dynamic replacement

- Status: `closed-bounded`
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
mutation. `ModifyProjectile.Run` initializes omitted components to zero before
broadcasting, so one component writes `[x, 0, 0]` and a pair writes
`[x, y, 0]`; only a full triple preserves a non-zero Z.

Sources:

- Ikemen `149402f`: `bytecode.go:8405-8410,9153-9165`
- Ikemen `149402f`: `compiler_functions.go:2558-2575`
- Ikemen `149402f`: `bytecode.go:7627-7634` (component evaluation/write)
- Ikemen `149402f`: `char.go:10403-10407,10980-10984,11201-11203`
- M.U.G.E.N 1.1: Projectile inherits the HitDef `down.velocity` parameter;
  `ModifyProjectile` is Ikemen-only and must not be called M.U.G.E.N parity.

## Bounded acceptance proposal

- Root-owned live Projectiles selected by `ModifyProjectile` accept finite
  static/dynamic `down.velocity` components evaluated once in caller context.
- A one-component mutation writes `[x, 0, 0]`; a pair writes `[x, y, 0]`; a
  full triple writes all three components. Omission is a no-op for the live
  vector. This matches the pinned Ikemen broadcast path and differs from
  component-preserving `ModifyHitDef` semantics.
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

Closed in T684. Typed compiler fields preserve static, mixed, and dynamic
components; the existing root caller resolver broadcasts the selected live
Projectile vector with the pinned zero-filled one/two/three-component rules.
Focused compiler/runtime coverage and the required trace pass. The trace
checksum is `f0bd0d1a` and the final checksum is `0664ee31`; aggregate QA is
`759/759` (`725` required, `34` optional). Helper-owned ModifyProjectile,
dynamic `n`, fresh default/inheritance recalculation, and full Projectile
parity remain separate work.
