# Issue 242 — Helper Projectile airguard.velocity missing-Z evidence

- Status: `active-research`
- Lane: `R1 projectile contact physics`
- Priority: `P1`

## Objective

Prove that a Projectile created by a Helper uses the pinned-Ikemen fresh
`airguard.velocity` missing-Z default and remains owned by the root player.

## Source gate

M.U.G.E.N 1.1 documents X/Y `airguard.velocity`, states that Projectile uses
the HitDef parameter set, and transfers Helper-created Projectiles to the root
player. Pinned Ikemen finalizes missing X/Y/Z before storing the Projectile.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html` Projectile and `airguard.velocity` sections
- pinned Ikemen `compiler_functions.go:2053-2054`
- pinned Ikemen `bytecode.go:7795-7802,8305`
- pinned Ikemen `char.go:741,892-894,2514-2519,7492-7505,10980-10984`

## Acceptance fixture

- A Helper-created Projectile authors non-zero air Z and an X/Y air-guard
  pair, deriving the missing Z from `air.velocity.z * 1.5`.
- Accepted airborne guard exposes X/Y/Z through physical velocity and
  GetHitVar.
- Required trace evidence retains Helper and Projectile controller execution,
  lifecycle, root/effect ownership, parent linkage, and target links.

## Claim ceiling

Describe Z as pinned-Ikemen compatibility. Do not claim M.U.G.E.N Z syntax,
dynamic Z, ModifyProjectile recomputation, team ownership, rollback,
localcoord equivalence, or full three-dimensional physics.
