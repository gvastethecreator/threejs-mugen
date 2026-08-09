# Issue 264 — Projectile guard.velocity dynamic fresh vector

- Status: closed-bounded
- Lane: R1 direct contact physics
- Priority: P1
- Cursor: T690

## Contract

Port the pinned Ikemen behavior for a fresh root-owned or Helper-authored
`Projectile guard.velocity`. One-, two-, and three-component static/mixed or
dynamic values are retained in typed IR and evaluated once in the original
caller context. Fresh missing X/Z components inherit the effective
`ground.velocity`; fresh Y defaults to zero. An accepted ground guard must
expose the resulting X/Y/Z vector through `GetHitVar(xvel/yvel/zvel)` and the
available guard physics, with Projectile lifecycle, root ownership, target,
and dynamic VarSet evidence.

## Authority

- Ikemen GO pin `149402f`: `compiler_functions.go:2126-2127` compiles the
  one-to-three component float payload; `char.go:737-741` initializes fresh
  guard velocity as `[NaN, 0, NaN]` and `char.go:890-891` derives missing X/Z
  from ground velocity. Contact consumption and GetHitVar exposure are in
  `char.go:10987-10991,11198-11200`.
- M.U.G.E.N 1.1 documents the X guard component and Projectile inheritance;
  the Y/Z completion and caller-context dynamic evaluation are explicitly
  bounded Ikemen compatibility behavior.

## Verification

- Focused compiler/Projectile/Helper coverage: `278/278` tests across the
  three nearest suites.
- Required trace:
  `synthetic-imported-projectile-dynamic-guard-velocity`
- Trace checksum: `781a8381`; final checksum: `968a063c`.
- Aggregate QA: `765/765` artifacts (`731` required, `34` optional).
- Full Vitest: `3784/3784` tests across `328` files.
- Typecheck and production build pass (`363` modules).

## Exclusions

Fresh default recalculation outside the guard vector, dynamic legacy `n`,
`ModifyProjectile`, Helper-owned live mutation, airguard/down/air/ground
vector parity, exact timing/effect stacking, teams, rollback, and full
M.U.G.E.N/Ikemen Projectile parity remain outside this bounded claim.
