# Issue 239 — HitDef airguard.velocity single-component compatibility

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Support the pinned-Ikemen one-component `airguard.velocity` form for direct
HitDef and root-owned live ModifyHitDef while retaining the M.U.G.E.N-derived
fresh Y default and live Y/Z preservation.

## Source gate

M.U.G.E.N 1.1 documents `airguard.velocity = x_velocity, y_velocity` and the
fresh default derived from `air.velocity`. Pinned Ikemen accepts up to three
components, writes X whenever the parameter is present, and writes Y/Z only
when authored. ModifyHitDef reuses the same evaluator against the live HitDef.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1613-1619`
- pinned Ikemen `compiler_functions.go:2053-2055,2286-2293`
- pinned Ikemen `bytecode.go:7795-7801,8332-8355`
- pinned Ikemen `char.go:892-894,10980-10984,11201-11203`

## Acceptance fixture

- Compile static and dynamic one-component forms for direct HitDef and
  ModifyHitDef; reject malformed input.
- Fresh direct HitDef replaces X and derives Y from the effective
  `air.velocity`, without inheriting prior metadata.
- Root-owned live ModifyHitDef replaces X and preserves Y/Z; full omission is
  a no-op.
- Prove accepted airborne-guard physical velocity and GetHitVar readback.
- Add one required imported trace that distinguishes fresh derivation from
  live preservation.

## Claim ceiling

Describe the one-component form as pinned-Ikemen compatibility, not an
explicit M.U.G.E.N 1.1 syntax guarantee. Do not claim Helpers, dynamic Z,
`guard.velocity` Y/Z, Projectile/ModifyProjectile, exact localcoord/facing or
gravity/landing timing, teams, rollback, or full air-guard physics.

## Closure evidence

- Direct HitDef and root-owned ModifyHitDef compile static and dynamic
  one-component forms while malformed forms remain rejected.
- Fresh HitDef replaces X and derives Y from effective `air.velocity` without
  inheriting adversarial metadata; live ModifyHitDef replaces only X and
  preserves Y/Z plus later omission.
- Accepted airborne guard exposes the effective vector through physical
  velocity and GetHitVar; the ground-guard route remains separate.
- Required trace checksum: `bbe20e82`; final-state checksum: `1da5cba1`.
- Full suite: 3709/3709. Aggregate traces: 738/738, with 704 required and 34
  optional. Typecheck and the 363-module production build pass.
