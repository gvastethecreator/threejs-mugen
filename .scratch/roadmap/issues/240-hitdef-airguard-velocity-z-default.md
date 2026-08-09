# Issue 240 — HitDef airguard.velocity missing-Z default

- Status: `active-research`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Add the pinned-Ikemen fresh default for an omitted `airguard.velocity` Z
component by deriving it from effective `air.velocity.z * 1.5`.

## Source gate

M.U.G.E.N 1.1 documents only X/Y for `airguard.velocity`. Pinned Ikemen
supports three components, initializes fresh X/Y/Z as missing, evaluates only
authored components, then derives each still-missing component from
`air.velocity`.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1613-1619`
- pinned Ikemen `compiler_functions.go:2053-2055`
- pinned Ikemen `bytecode.go:7795-7801`
- pinned Ikemen `char.go:713-718,857-861,10980-10984,11201-11203`

## Acceptance fixture

- Fresh direct HitDef omission, one-component, and two-component forms derive
  Z from the effective air velocity.
- An explicit third component wins over the derived value.
- Live ModifyHitDef omission and partial X/Y mutations preserve current Z.
- Accepted airborne guard exposes the derived Z through physical depth and
  GetHitVar.
- Add one required imported trace with non-zero air Z and derived guard Z.

## Claim ceiling

Describe Z as pinned-Ikemen compatibility, not M.U.G.E.N 1.1 syntax. Do not
claim imported static-move or Projectile breadth, dynamic Z expressions,
exact localcoord/facing or landing timing, teams, rollback, or full depth
physics.
