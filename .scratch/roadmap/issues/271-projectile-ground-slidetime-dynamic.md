# T697 — Projectile `ground.slidetime` dynamic expressions

Status: closed-bounded (2026-08-09)

## Contract

Fresh root and Helper-authored Projectiles now preserve a typed
`ground.slidetime` expression, evaluate it once in the original caller
context, and carry the finite truncated value into an accepted grounded hit.
The receiver exposes the value through `GetHitVar(slidetime)`. The required
traces also prove Projectile lifecycle, target links, and Helper/root/parent
ownership for the Helper route.

Pinned upstream mapping:

- M.U.G.E.N 1.1 documents `ground.slidetime` as an integer ground-hit
  parameter with an omitted default of zero (`sctrls.html`, ground hit
  timing section).
- Ikemen GO pin `149402f` compiles one integer expression in
  `compiler_functions.go`, evaluates it in the Projectile caller in
  `bytecode.go`, and copies it to `GetHitVar(slidetime)` during accepted
  normal contact in `char.go`.

## Evidence

- Root trace `synthetic-imported-projectile-dynamic-ground-slidetime`:
  trace checksum `08b376db`, final checksum `856bcded`.
- Helper trace `synthetic-imported-helper-projectile-dynamic-ground-slidetime`:
  trace checksum `30f9d1f7`, final checksum `e4a0be12`.
- `pnpm qa:trace`: 775/775 artifacts, 741 required, 34 optional, 0 failed.
- `pnpm test`: 328 files, 3806/3806 tests passed.
- `pnpm run typecheck`: passed.
- `pnpm build`: 363 modules passed; only the existing chunk-size warning remains.

## Boundaries

This cut does not claim fresh default recalculation beyond the existing local
Projectile model, live `ModifyProjectile`, guard/air/down timing, exact slide
countdown or tick ordering, negative/overflow parity, teams, rollback, or full
Projectile timing parity.

Next queue item: map the next unclaimed Projectile timing or mutation seam
against the pinned source before implementation.
