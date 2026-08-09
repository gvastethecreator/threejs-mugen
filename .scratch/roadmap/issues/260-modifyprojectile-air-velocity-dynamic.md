# Issue 260 — live ModifyProjectile air.velocity dynamic replacement

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next Projectile vector seam after T685: evaluate live
`ModifyProjectile air.velocity` expressions once in the original root caller
context, broadcast the selected vector to matching Projectiles, and prove that
an airborne hit consumes the changed vector.

## Source gate

Pinned Ikemen GO revision `149402f` compiles `ModifyProjectile` through the
Projectile HitDef parameter set. Its runtime evaluates `air.velocity`
components against the original caller, initializes omitted components to zero,
and broadcasts the result to every selected Projectile. A whole omission is a
no-op; one, two, and three authored components therefore write
`[x,0,0]`, `[x,y,0]`, or `[x,y,z]`. Fresh Projectile inheritance/defaults are
not rerun during mutation, and the upstream helper guard rejects
helper-owned `ModifyProjectile`.

Sources:

- Ikemen `compiler_functions.go:2049-2051,2550-2573`
- Ikemen `bytecode.go:8405-8410,9241-9254`
- Ikemen `char.go:10403-10407,11027-11029,11192-11194`
- M.U.G.E.N 1.1 Projectile inherits HitDef `air.velocity`; live
  `ModifyProjectile` is Ikemen-only and is not claimed as M.U.G.E.N parity.

## Bounded acceptance

- Root-owned live Projectiles selected by `ModifyProjectile` retain static,
  mixed, and dynamic `air.velocity` components in typed IR.
- Dynamic values resolve once in root caller context and use the pinned
  zero-filled one/two/three-component mutation semantics; omission preserves
  the live vector.
- An accepted airborne hit exposes the replacement through physics,
  `GetHitVar(xvel/yvel/zvel)`, target link, and Projectile lifecycle evidence.

## Explicit exclusions

Helper-owned `ModifyProjectile` (rejected by the pinned upstream runtime),
dynamic `n`, fresh default/inheritance recalculation, live `ModifyHitDef`,
`airguard.velocity`/`down.velocity`/`ground.velocity` vector seams, exact timing
or team/rollback parity, localcoord/facing edge cases, and full
M.U.G.E.N/Ikemen Projectile parity remain outside the claim.

## Verification

Closed in T686. Focused compiler/runtime and trace gates pass. The full Vitest
suite passes `3768/3768` tests across `328` files; typecheck and the
`363`-module build pass. Aggregate QA passes `761/761` artifacts (`727`
required, `34` optional). Required trace
`synthetic-imported-modifyprojectile-dynamic-air-velocity` has trace checksum
`c335ca9d` and final checksum `2ecb639a`.
