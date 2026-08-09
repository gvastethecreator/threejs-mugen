# Issue 267 — Projectile down.hittime dynamic

- Status: closed-bounded
- Lane: R1 Projectile contact timing
- Priority: P1
- Cursor: T693

## Contract

Close the fresh root Projectile `down.hittime` seam. A Projectile spawned by a
root caller evaluates the authored scalar once in caller context, keeps the
pinned fresh default of `20` when omitted, and exposes the resolved value on an
accepted lying-target contact through `GetHitVar(hittime)`. The Projectile
payload, target link, lifecycle, and imported Common1-style get-hit route must
remain observable.

Helper caller resolution is covered by focused spawn tests. This issue does not
claim Helper-owned trace breadth or live `ModifyProjectile` mutation.

## Authority

- Ikemen GO pin `149402f`: the Projectile compiler reuses the HitDef scalar,
  evaluates it in the active caller, and finalizes a fresh omission to `20`;
  lying contact copies the effective value into the receiver hit variables.
- M.U.G.E.N 1.1 documents the compatible `down.hittime` parameter and its
  interaction with zero/non-zero `down.velocity.y`; `ModifyProjectile` is not
  part of this claim because the pinned runtime switch does not mutate it.

## Verification

- Focused compiler/runtime coverage: Projectile static, dynamic, malformed,
  omitted, unresolved, and Helper caller cases pass.
- Required trace:
  `synthetic-imported-projectile-dynamic-down-hittime`
- Trace checksum: `800059f`; final checksum: `ac8eff48`.
- Aggregate QA: `768/768` artifacts (`734` required, `34` optional).
- Full Vitest: `3793/3793` tests across `328` files; typecheck and the
  `363`-module build pass.

## Exclusions

Live `ModifyProjectile`, non-zero `down.velocity.y` launch behavior, exact
countdown/landing timing, negative/overflow values, team/rollback topology,
and full Projectile timing parity remain outside this bounded slice.
