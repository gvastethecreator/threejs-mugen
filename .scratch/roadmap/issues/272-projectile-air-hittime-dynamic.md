# T698 — Projectile `air.hittime` dynamic expressions

Status: closed-bounded

## Contract

Fresh root- and Helper-authored Projectiles now retain a typed
`air.hittime` expression, evaluate it once in the original caller context,
truncate finite values, and feed the accepted airborne non-falling hit path.
The receiver exposes `GetHitVar(hittime)=16` alongside the authored airborne
velocity. Helper evidence also preserves root/parent ownership and Projectile
lifecycle links.

## Source mapping

- M.U.G.E.N 1.1: `sctrls.html`, `air.hittime` is an integer airborne hit
  duration, defaults to 20, and is ignored when `fall=1`.
- Ikemen GO pin `149402f`, `compiler_functions.go:1989-1992`, compiles one
  integer expression; `bytecode.go:7715-7716` evaluates it in the Projectile
  caller context; `char.go:728,11023-11029,11060-11063` supplies the fresh
  default and copies the airborne value into GetHitVar/contact state.

## Evidence

- Aggregate QA: `777/777` artifacts, `743` required, `34` optional, zero
  failures.
- Root trace: `synthetic-imported-projectile-dynamic-air-hittime`, checksum
  `d95c52d1`, final checksum `cf7a06ba`.
- Helper trace: `synthetic-imported-helper-projectile-dynamic-air-hittime`,
  checksum `c153c511`, final checksum `0e089466`.
- Full Vitest: `3810/3810` tests across `328` files; typecheck and the
  `363`-module production build pass.

## Boundaries

Fresh default recalculation beyond the local Projectile seam, live
`ModifyProjectile`, ground/down/guard timing, exact countdown/landing/physics
parity, negative or overflow values, ReversalDef, teams, rollback, and full
Projectile timing parity remain unclaimed.
