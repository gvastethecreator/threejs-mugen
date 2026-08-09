# Issue 259 — live ModifyProjectile airguard.velocity dynamic replacement

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next Projectile vector seam after T684: evaluate live
`ModifyProjectile airguard.velocity` expressions once in the original root
caller context, broadcast the selected vector to matching Projectiles, and
prove that an airborne guard consumes the changed vector.

## Source gate

Pinned Ikemen GO revision `149402f` compiles `ModifyProjectile` through the
Projectile HitDef parameter set. Its runtime evaluates `airguard.velocity`
components against the original caller, initializes omitted components to
zero, and writes the resulting triplet to every selected Projectile. A whole
omission is a no-op; one, two, and three authored components therefore write
`[x,0,0]`, `[x,y,0]`, or `[x,y,z]`. The fresh Projectile inheritance/default
chain is not rerun during mutation.

Sources:

- Ikemen `compiler_functions.go:2053-2055,2550-2573`
- Ikemen `bytecode.go:8405-8410,9241-9255`
- Ikemen `char.go:10403-10407,10980-10984,11201-11203`
- M.U.G.E.N 1.1 Projectile inherits the HitDef `airguard.velocity` parameter;
  `ModifyProjectile` is Ikemen-only and is not claimed as M.U.G.E.N parity.

## Bounded acceptance

- Root-owned live Projectiles selected by `ModifyProjectile` retain static,
  mixed, and dynamic `airguard.velocity` components in typed IR.
- Dynamic values resolve once in root caller context and use the pinned
  zero-filled one/two/three-component mutation semantics; omission preserves
  the live vector.
- A real airborne guard exposes the replacement through physics,
  `GetHitVar(xvel/yvel/zvel)`, target link, and Projectile lifecycle evidence.

## Explicit exclusions

Helper-owned `ModifyProjectile` (the upstream runtime rejects helper-owned
mutation), dynamic `n`, fresh default/inheritance recalculation, live
`ModifyHitDef`, Projectile/ModifyProjectile timing parity beyond this trace,
localcoord/facing edge cases, teams, rollback, and full M.U.G.E.N/Ikemen
Projectile parity remain outside the claim.

## Verification

Closed in T685. Focused compiler/runtime coverage passes; the full Vitest
suite passes `3764/3764` tests across `328` files; typecheck and the
`363`-module build pass. Aggregate QA passes `760/760` artifacts (`726`
required, `34` optional). Required trace
`synthetic-imported-modifyprojectile-dynamic-airguard-velocity` has trace
checksum `c4d55bd9` and final checksum `f0982ef8`.
