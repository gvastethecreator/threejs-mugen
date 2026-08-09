# Issue 262 — ModifyProjectile ground.velocity dynamic replacement

- Status: closed-bounded
- Lane: R1 direct contact physics
- Priority: P1
- Cursor: T688

## Contract

Port the pinned Ikemen behavior for a root-owned live `ModifyProjectile`
`ground.velocity` controller. Static, mixed, and dynamic X/Y/Z components are
retained in typed IR and evaluated once in the original caller context. The
selected Projectile receives the authored components while omitted siblings
remain unchanged. An accepted grounded hit must expose the resulting vector
through contact physics and `GetHitVar(xvel/yvel/zvel)`, with target and
Projectile lifecycle evidence.

## Authority

- Ikemen GO pin `149402f`, `compiler_functions.go:2073-2122` compiles the
  grounded velocity components and its legacy `n` form.
- `bytecode.go:8405-8410,9289-9303` evaluates the ModifyProjectile payload in
  the original caller and broadcasts authored component replacements.
- `char.go:10939-10953,11192-11194` consumes and exposes the accepted-hit
  velocity metadata.

## Verification

- Required trace: `synthetic-imported-modifyprojectile-dynamic-ground-velocity`
- Trace checksum: `0cda3247`
- Aggregate QA: `763/763` artifacts (`729` required, `34` optional)
- Full Vitest: `3776/3776` tests across `328` files
- Typecheck and production build pass.

## Exclusions

Helper-owned ModifyProjectile (blocked by the pinned upstream helper guard),
dynamic legacy `n`, fresh-default recalculation, guard/air/down/airguard vector
families, cornerpush, exact tick/landing timing, teams, rollback, and full
M.U.G.E.N/Ikemen Projectile parity remain outside this bounded claim.
