# Issue 204 — Ikemen ModifyProjectile getpower

- Status: `closed-bounded`
- Lane: `R2 Projectile live HitDef mutation`
- Priority: `P1`

## Objective

Port pinned-Ikemen `ModifyProjectile getpower` through selected live root and
Helper Projectiles, dynamic caller-context resolution, and later accepted
hit/guard attacker power gain.

## Source gate

Pinned Ikemen GO commit `149402f` reuses Projectile parameter compilation for
`ModifyProjectile`, evaluates `getpower` once in the caller, and writes the
same hit/guard pair to every selected Projectile. Its omitted second component
is zero. M.U.G.E.N 1.1 has no `ModifyProjectile` controller.

Source symbols:

- `src/compiler_functions.go:2558-2575`
- `src/bytecode.go:8875-8884`
- `src/char.go:11317-11329`

## Port ledger

| Item | Decision |
| --- | --- |
| Static pair | replace selected Projectile hit/guard attacker rewards |
| Dynamic pair | resolve once in caller context, then broadcast |
| One value | write hit value and guard zero |
| Contact | existing hit/guard getpower consumer uses the live replacement |

## Acceptance fixture

- Compile static and dynamic one/two-component `getpower` for
  `ModifyProjectile` and reject malformed input.
- Prove selected root and Helper Projectiles receive the replacement.
- Prove one dynamic value writes guard zero.
- Prove later accepted hit and guard contacts select the mutated attacker gain.
- Add one required imported trace with mutation and attacker power evidence.

## Claim ceiling

Do not claim M.U.G.E.N controller support, fresh-default recomputation,
Helper-owned ModifyHitDef, exact int32 overflow or `IErr` clamping,
power-owner/team topology, exact deferred power timing, rollback,
global `data/mugen.cfg`, or full Projectile parity.

## Closeout evidence

- Compiler/runtime core: 147/147; root/Helper integrations: 3/3.
- Full suite: 3516/3574 with the same 58 inherited retired-roster failures.
- Production build: 362 modules.
- Required trace corpus: 702/702 (668 required, 34 optional).
- `synthetic-imported-modifyprojectile-dynamic-getpower`: checksum `8d08be3e`,
  final checksum `7b9b7719`, attacker power 44, defender life 969.
- Typecheck, boundary, redirect-boundary, and diff-hygiene gates pass.
