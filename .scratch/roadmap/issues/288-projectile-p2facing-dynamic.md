# Issue 288 — Dynamic Projectile `p2facing` in caller context

## Status

Closed-bounded as T714 on 2026-08-11.

## Contract

M.U.G.E.N 1.1 documents `p2facing` as an inherited HitDef parameter for
Projectiles. The pinned Ikemen GO revision `149402f` compiles it as one
integer expression, evaluates it when the fresh Projectile HitDef runs in the
original caller context, and applies the signed value only after an accepted
unguarded contact. This slice keeps the static T713 facing latch and adds the
dynamic caller path.

The local compiler stores `p2FacingExpression` separately from static
`p2Facing`. Root dispatch resolves it once with the original actor context;
Helper-owned Projectiles use the Helper expression context. The resolved
finite integer is stored on the Projectile, so the existing deferred facing
latch, `GetHitVar(facing)`, and contact ownership path are shared by static and
dynamic values.

Source pins:

- `.scratch/external/mugen-1.1b1/docs/sctrls.html` HitDef `p2facing` and
  Projectile inheritance sections.
- `.scratch/upstream-ikemen-go/src/compiler_functions.go` revision `149402f`,
  `hitDefSub`/`projectileSub` `p2facing` integer expression.
- `.scratch/upstream-ikemen-go/src/bytecode.go` revision `149402f`, Projectile
  HitDef evaluation in the caller.
- `.scratch/upstream-ikemen-go/src/char.go` revision `149402f`, Projectile
  facing as the source direction and accepted-hit target-facing update.

## Evidence

- Compiler, ProjectileSystem, root dispatch, and Helper caller tests cover
  static/dynamic/malformed values, truncation, and unresolved fail-closed
  behavior.
- Required trace
  `synthetic-imported-projectile-dynamic-p2facing` proves
  `VarSet(0)=1 -> Projectile p2facing=var(0) -> accepted hit -> deferred
  facing`, with target link, lifecycle, `GetHitVar(facing)` branch, and no
  guard/override/reversal route.
- Trace checksum: `0aceed69`; final checksum: `2d5de80d`.
- Aggregate `pnpm qa:trace`: `805/805` artifacts (`771` required,
  `34` optional), zero failures.

## Allowed claim

Root-owned fresh Projectiles resolve finite dynamic `p2facing` in caller
context and Helper-owned fresh Projectiles resolve their Helper context; both
reuse the bounded accepted-unguarded-hit deferred-facing and metadata path.

## Out of scope

`ModifyProjectile`, Projectile guards, `p1facing`, ReversalDef, HitOverride
arbitration, `noautoturn` interaction, negative/zero edge matrices, exact
engine tick parity, custom-state ownership, teams, rollback, and full
M.U.G.E.N/Ikemen parity remain open.
