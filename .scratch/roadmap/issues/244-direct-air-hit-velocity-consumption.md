# Issue 244 — Direct air-hit velocity consumption

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Consume the existing static direct-HitDef `air.velocity` X/Y/Z vector for an
accepted hit against an airborne defender.

## Source gate

M.U.G.E.N 1.1 documents X/Y `air.velocity` with zero defaults. Pinned Ikemen
also carries Z, applies the air vector to an airborne receiver, and publishes
the effective components through GetHitVar.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html` HitDef `air.velocity`
- pinned Ikemen `compiler_functions.go:2049-2051`
- pinned Ikemen `bytecode.go:7787-7794`
- pinned Ikemen `char.go:737-741,11027-11029,11192-11194`

## Acceptance fixture

- Accepted direct airborne hits select static air X/Y/Z instead of the
  adversarial ground vector.
- Grounded, down, and guard contacts keep their existing vector selection.
- Imported static and live direct HitDef metadata reach physical velocity and
  GetHitVar; Projectile behavior does not change.
- Add one required imported airborne-hit trace with distinct ground and air
  vectors.

## Claim ceiling

Claim official M.U.G.E.N X/Y consumption and pinned-Ikemen Z only. Do not
claim dynamic `air.velocity` expressions, `n` syntax, live ModifyHitDef X/Y,
Projectile breadth, lying-state fallback, exact localcoord/facing or landing
timing, teams, rollback, or full air-hit physics.

## Closure evidence

- Direct root/Helper hits select `hitVelocities.air` X/Y/Z only for airborne
  defenders; grounded, down, and guard routes keep their existing vectors.
- Runtime integration contrasts an adversarial ground vector against the air
  vector and proves physical velocity plus GetHitVar readback.
- Required imported trace reaches target 77, applies `7/-5/3` through
  HitVelSet, and excludes guard, fall, and grounded routes.
- Required trace checksum: `1fe99cdb`; final-state checksum: `28fa04d0`.
- Full suite: 3719/3719. Aggregate traces: 743/743, with 709 required and 34
  optional. Typecheck and the 363-module production build pass.
