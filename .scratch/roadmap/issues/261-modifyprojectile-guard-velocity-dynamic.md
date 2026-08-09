# Issue 261 — live ModifyProjectile guard.velocity dynamic replacement

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next live Projectile vector seam after T686: retain
`ModifyProjectile guard.velocity` static, mixed, and dynamic components in
typed IR, resolve them once in the root caller context, broadcast the selected
triplet, and prove that a real ground guard consumes the replacement.

## Source gate

Pinned Ikemen GO revision `149402f` compiles `ModifyProjectile` through the
Projectile HitDef parameter set. Its runtime evaluates `guard.velocity` in the
original caller context and writes zero-filled one-, two-, or three-component
values to every selected Projectile. The upstream helper guard rejects
helper-owned `ModifyProjectile` mutation.

Sources:

- Ikemen `compiler_functions.go:2049-2051,2550-2573`
- Ikemen `bytecode.go:8405-8410,9270-9300`
- Ikemen `char.go:10973-10991,11198-11203`
- M.U.G.E.N 1.1 documents Projectile HitDef guard parameters; live
  `ModifyProjectile` remains an Ikemen-only claim here.

## Bounded acceptance

- Root-owned live Projectiles selected by `ModifyProjectile` retain typed
  `guard.velocity` static/mixed/dynamic components.
- Dynamic values resolve once in root caller context and use pinned zero-filled
  one-/two-/three-component replacement semantics; omission remains a no-op.
- An accepted ground guard exposes the replacement through
  `GetHitVar(xvel/yvel/zvel)`, guard physics, target link, and Projectile
  lifecycle evidence.

## Explicit exclusions

Helper-owned `ModifyProjectile` (rejected by the pinned upstream runtime),
dynamic `n`, fresh default recalculation, `air.velocity`/`airguard.velocity`/
`down.velocity`/`ground.velocity` live seams, `ModifyHitDef`, cornerpush,
exact timing or team/rollback parity, localcoord/facing edge cases, and full
M.U.G.E.N/Ikemen Projectile parity remain outside the claim.

## Verification

Closed in T687. Focused compiler/runtime coverage passes `15/15` selected
tests; the required trace passes `1/1`; typecheck and diff hygiene pass.
Aggregate QA passes `762/762` artifacts (`728` required, `34` optional).
Required trace `synthetic-imported-modifyprojectile-dynamic-guard-velocity`
has trace checksum `f1a7b429` and final checksum `df93f663`.
