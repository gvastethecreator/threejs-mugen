# Issue 246 — Live ModifyHitDef air.velocity expressions

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve live root-owned `ModifyHitDef air.velocity` X/Y expressions in caller
context while preserving omitted active components.

## Source gate

Pinned Ikemen compiles `air.velocity` float expressions through the shared
HitDef parameter block and applies authored components to the active HitDef.
ModifyHitDef reuses that evaluator without resetting or finalizing the live
payload.

Source symbols:

- M.U.G.E.N 1.1 HitDef `air.velocity` documentation
- pinned Ikemen `compiler_functions.go:2049-2051,2286-2293`
- pinned Ikemen `bytecode.go:7787-7794,8332-8355`
- pinned Ikemen `char.go:11027-11029,11192-11194`

## Acceptance fixture

- A one-component live mutation replaces X and preserves Y/Z.
- A two-component mutation replaces X/Y and preserves Z; full omission is a
  no-op.
- Redirected root-owned mutation evaluates expressions in caller context and
  accepted airborne hit exposes the live vector through physics/GetHitVar.
- Add one required redirected ModifyHitDef imported trace.

## Claim ceiling

Describe ModifyHitDef as pinned-Ikemen compatibility. Do not claim Helper-owned
ModifyHitDef, dynamic Z, `n` syntax, Projectile/ModifyProjectile, automatic
re-defaulting of omitted components, exact localcoord/facing or landing timing,
teams, rollback, or full air-hit physics.

## Closure evidence

- Live omission preserves X/Y/Z; one-component mutation replaces X only; a
  pair replaces X/Y; existing static Z remains compatible.
- RedirectID mutation evaluates expressions in the root caller and preserves
  the target HitDef's omitted siblings.
- Accepted airborne hit exposes the final vector through physical velocity and
  GetHitVar.
- Required trace checksum: `b72effd6`; final-state checksum: `ebe6c2eb`.
- Full suite: 3725/3725. Aggregate traces: 745/745, with 711 required and 34
  optional. Typecheck and the 363-module production build pass.
