# Issue 263 — Projectile ground.velocity dynamic fresh vector

- Status: closed-bounded
- Lane: R1 direct contact physics
- Priority: P1
- Cursor: T689

## Contract

Port the pinned Ikemen behavior for a fresh root-owned or Helper-authored
`Projectile ground.velocity`. One-, two-, and three-component static/mixed or
dynamic values are retained in typed IR and evaluated once in the original
caller context. Missing dynamic siblings on a fresh Projectile resolve to zero.
An accepted grounded hit must expose the resulting X/Y/Z vector through
contact physics and `GetHitVar(xvel/yvel/zvel)`, with root/Helper caller,
target, and Projectile lifecycle evidence.

## Authority

- Ikemen GO pin `149402f`, `compiler_functions.go:2073-2122` compiles
  `ground.velocity` components and `bytecode.go:7811-7816` evaluates the
  fresh HitDef payload in the caller context.
- `char.go:737-741` initializes fresh ground velocity to zero and
  `char.go:11051-11053,11189-11191` consumes and exposes the accepted-hit
  vector.
- M.U.G.E.N 1.1 documents `Projectile` inheritance from HitDef and the
  grounded velocity parameters; this issue's dynamic caller resolution and
  Z evidence are explicitly pinned Ikemen behavior.

## Verification

- Focused compiler/Projectile/Helper coverage: `275/275` tests across the
  three nearest suites.
- Required trace:
  `synthetic-imported-projectile-dynamic-ground-velocity`
- Trace checksum: `7782fd2a`; final checksum: `494ad91d`.
- Aggregate QA: `764/764` artifacts (`730` required, `34` optional).
- Full Vitest: `3780/3780` tests across `328` files.
- Typecheck and production build pass (`363` modules).

## Exclusions

Fresh default recalculation beyond this vector, dynamic legacy `n`,
`ModifyProjectile` (closed separately in issue 262), Helper-owned live
mutation, guard/air/down/airguard vectors, cornerpush, exact tick/landing
timing, teams, rollback, and full M.U.G.E.N/Ikemen Projectile parity remain
outside this bounded claim.
