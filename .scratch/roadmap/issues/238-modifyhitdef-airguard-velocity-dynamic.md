# Issue 238 — ModifyHitDef airguard.velocity X/Y expressions

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve exact X/Y `airguard.velocity` pairs for a root-owned live
ModifyHitDef, preserve Z and omission, and consume the changed vector in an
accepted airborne guard.

## Source gate

M.U.G.E.N 1.1 documents the base `airguard.velocity` field but not
ModifyHitDef. Pinned Ikemen GO reuses HitDef parameter evaluation for
ModifyHitDef and writes only authored components into the active normal HitDef.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1613-1619`
- pinned Ikemen `compiler_functions.go:2053-2055,2286-2293`
- pinned Ikemen `bytecode.go:7795-7801,8332-8355`
- pinned Ikemen `char.go:892-894,10980-10984,11201-11203`

## Acceptance fixture

- Compile literal, mixed, and dynamic exact X/Y pairs.
- Evaluate the pair in root caller context through RedirectID.
- Replace live X/Y while preserving Z and full omission.
- Consume the changed vector in accepted airborne guard and expose it through
  GetHitVar plus physical velocity.
- Add one required imported live-mutation trace.

## Claim ceiling

Do not claim partial one-component forms, Helpers, dynamic Z,
`guard.velocity` Y/Z, Projectile/ModifyProjectile, exact localcoord/facing or
gravity/landing timing, teams, rollback, or full air-guard physics.

## Closure evidence

- Literal, mixed, and dynamic exact X/Y pairs compile for ModifyHitDef; single
  and malformed forms remain outside this slice.
- Root-owned RedirectID mutation replaces X/Y in caller context, preserves Z,
  and a later omitted ModifyHitDef preserves the full live vector.
- Accepted airborne guard consumes the changed vector through physical
  velocity and GetHitVar.
- Required trace checksum: `57d92d73`; final-state checksum: `d2a8efe2`.
- Full suite: 3706/3706. Aggregate traces: 737/737, with 703 required and 34
  optional. Typecheck and the 363-module production build pass.
