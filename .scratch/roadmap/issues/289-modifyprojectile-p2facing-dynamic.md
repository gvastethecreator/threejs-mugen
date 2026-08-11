# Issue 289 — Dynamic `ModifyProjectile p2facing`

Status: **closed-bounded** (T715, 2026-08-11)

## Contract

`ModifyProjectile p2facing` is retained as typed static or caller expression
data. Root execution resolves a finite expression once in the original caller
context, applies it only to selected live Projectiles, and reuses the existing
accepted-unguarded-hit deferred-facing latch and `GetHitVar(facing)` carrier.
Helper-owned ModifyProjectile uses the Helper caller resolver and preserves its
ownership selector.

An unresolved or non-finite dynamic value fails closed and leaves the selected
Projectile unchanged. Static values remain compatible with the existing path.

## Upstream basis

- Ikemen GO pin `149402f`: `compiler_functions.go:2558-2575` reuses the
  Projectile parameter block for ModifyProjectile; `bytecode.go:9126-9130`
  evaluates `p2facing` once in the caller and broadcasts the result to the
  selected Projectiles.
- Ikemen GO explicitly leaves `p1facing` and `p1getp2facing` unsupported for
  projectiles in `bytecode.go:9076-9078`.
- M.U.G.E.N 1.1 documents Projectile HitDef parameters but has no
  `ModifyProjectile` controller. This slice is therefore Ikemen-only.

## Evidence

- Compiler, ProjectileSystem, and Helper focused tests pass.
- Required trace:
  `synthetic-imported-modifyprojectile-dynamic-p2facing-golden`.
- Trace checksum `00ed1b03`, final checksum `b0693d99`.
- `pnpm qa:trace`: `806/806` artifacts (`772` required, `34` optional).
- The trace proves VarSet → Projectile → ModifyProjectile, accepted unguarded
  contact, `GetHitVar(facing)=1`, deferred target-facing change, lifecycle,
  target link, and final life 963.
- Helper caller-context mutation is covered by `EffectActorSystem` focused
  runtime tests.

## Explicit exclusions

Guards, HitOverride, reversals, `p1facing`, `p1getp2facing`, noautoturn,
multi-selection/broadcast parity, exact engine tick ordering, custom-state
ownership, teams, rollback, and full M.U.G.E.N/Ikemen Projectile parity remain
open. Dynamic Z/overflow/int32 behavior is not claimed.
