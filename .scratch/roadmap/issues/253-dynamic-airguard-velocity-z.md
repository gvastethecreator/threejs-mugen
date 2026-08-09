# Issue 253 — dynamic airguard.velocity Z

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the pinned Ikemen compatibility gap for the third component of
`airguard.velocity`. Fresh direct HitDef and live `ModifyHitDef` values must
resolve a finite caller-context Z expression, while missing fresh components
continue through the pinned defaults and live omissions preserve the active
vector.

## Source gate

The pinned Ikemen runtime compiles up to three `airguard.velocity` float
expressions, evaluates them in the caller context, and consumes all three
components during airborne guard resolution. Fresh HitDefs finalize missing
components from `air.velocity`, including `air.velocity.z * 1.5`; live
`ModifyHitDef` uses the active HitDef without fresh finalization.

Sources:

- Ikemen `149402f`: `compiler_functions.go:2053-2055`
- Ikemen `149402f`: `bytecode.go:7795-7801,8332-8355`
- Ikemen `149402f`: `char.go:741,892-894,10980-10984,11201-11203`
- M.U.G.E.N 1.1 documents X/Y `airguard.velocity`; dynamic Z is therefore
  explicitly an Ikemen compatibility claim.

## Acceptance contract

- Direct and Helper fresh HitDefs accept one-, two-, and three-component
  caller-context expressions; a third finite expression reaches the live
  `airGuardVelocityZ`/GetHitVar path.
- Fresh missing Y/Z components still derive from the effective air velocity.
- Root and Helper live `ModifyHitDef` accept a dynamic third component; one
  component preserves Y/Z, two preserve Z, three replaces X/Y/Z, and omission
  is a no-op.
- An accepted airborne guard exposes the final Z through physics and
  `GetHitVar(zvel)`.

## Closure evidence

- Compiler/runtime/Helper coverage: `245/245` focused tests.
- Playable root/Helper integration: `2/2` airguard cases, including dynamic
  triple and live RedirectID mutation with Z preservation.
- Required trace:
  `synthetic-imported-hitdef-dynamic-airguard-velocity-z`.
- Required trace checksum: `c0164925`; final checksum: `47a2c7d7`.
- Aggregate trace gate passes `752/752` artifacts (`718` required,
  `34` optional); the full suite passes `3741/3741` tests across `328` files;
  typecheck and the `363`-module build pass.

## Claim ceiling

Do not claim M.U.G.E.N dynamic-Z parity, `n` syntax, Projectile or
ModifyProjectile dynamic-Z support, exact landing/gravity timing, localcoord or
facing equivalence, teams, rollback, or full engine parity.

## Next bounded slice

T680 is source-mapped for Projectile fresh `airguard.velocity` dynamic-Z
resolution. Keep Projectile/ModifyProjectile separate from this direct/Helper
claim until its caller context, lifecycle, and airborne-guard trace are gated.
