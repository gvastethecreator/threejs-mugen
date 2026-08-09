# Issue 243 — Imported static HitDef airguard.velocity missing-Z default

- Status: `closed-bounded`
- Lane: `R1 imported contact physics`
- Priority: `P1`

## Objective

Complete missing X/Y/Z components for the first static imported HitDef using
the pinned-Ikemen fresh `airguard.velocity` defaults.

## Source gate

M.U.G.E.N 1.1 documents X/Y and their defaults. Pinned Ikemen accepts up to
three components, writes only authored values, and derives every missing fresh
component; Z uses `air.velocity.z * 1.5`.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html` HitDef `airguard.velocity`
- pinned Ikemen `compiler_functions.go:2053-2055`
- pinned Ikemen `bytecode.go:7795-7802`
- pinned Ikemen `char.go:741,892-894`

## Acceptance fixture

- Imported static omission, one-component, and two-component forms complete
  missing values from effective air velocity; explicit triples win.
- Static move metadata exposes the completed vector through its guard aliases.
- A required imported-static trace proves accepted airborne guard and
  GetHitVar Z without executing the disabled HitDef controller at runtime.

## Claim ceiling

Limit support to the first static HitDef projected by `buildStateMoves`.
Describe Z as pinned-Ikemen compatibility. Do not claim expression evaluation,
multiple-HitDef trigger fidelity, malformed forms, Modify controllers,
Projectile breadth, localcoord equivalence, teams, rollback, or full depth
physics.

## Closure evidence

- Imported static omission, one-component, and two-component forms complete
  missing values from effective air velocity; explicit triples win.
- Static move metadata and accepted airborne guard expose the completed vector
  through physical depth and GetHitVar.
- The required trace disables live HitDef dispatch and proves the contact from
  projected static move metadata with zero executed HitDef controllers/ops.
- Required trace checksum: `aefa667a`; final-state checksum: `fd077b51`.
- Full suite: 3716/3716. Aggregate traces: 742/742, with 708 required and 34
  optional. Typecheck and the 363-module production build pass.
