# Issue 241 — Projectile airguard.velocity missing-Z default

- Status: `closed-bounded`
- Lane: `R1 projectile contact physics`
- Priority: `P1`

## Objective

Add the pinned-Ikemen fresh Projectile default for a missing
`airguard.velocity` Z component by deriving it from effective
`air.velocity.z * 1.5`.

## Source gate

M.U.G.E.N 1.1 documents X/Y `airguard.velocity` and states that Projectile
uses the HitDef parameter set. Pinned Ikemen supports a third component,
evaluates only authored components, and finalizes missing X/Y/Z for a fresh
Projectile HitDef.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1613-1619` and Projectile HitDef inheritance
- pinned Ikemen `compiler_functions.go:2053-2055`
- pinned Ikemen `bytecode.go:7627-7642,7846,7902-7915,8120-8133`
- pinned Ikemen `char.go:713-717,802-861,10403-10407`

## Acceptance fixture

- Fresh root Projectile omission, one-component, and two-component forms
  derive Z from effective air velocity.
- An explicit third component wins over the derived value.
- Accepted airborne guard exposes the effective Projectile Z through physical
  depth and GetHitVar.
- Add one required imported root-Projectile trace with lifecycle and guard
  contact evidence.

## Claim ceiling

Describe Z as pinned-Ikemen compatibility, not M.U.G.E.N 1.1 syntax. Do not
claim Helper Projectile breadth, imported static-move mirroring,
ModifyProjectile recomputation, dynamic Z expressions, exact localcoord or
landing timing, teams, rollback, or full Projectile physics.

## Closure evidence

- Fresh root Projectile omission, one-component, and two-component forms
  derive missing Z from effective `air.velocity.z * 1.5`; explicit Z wins.
- Accepted airborne guard exposes the effective Z through physical depth and
  `GetHitVar(zvel)` without affecting the ground-guard route.
- Required trace checksum: `f2c12237`; final-state checksum: `9238b559`.
- Full suite: 3712/3712. Aggregate traces: 740/740, with 706 required and 34
  optional. Typecheck and the 363-module production build pass.
