# Issue 226 — Dynamic direct HitDef ground.hittime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `ground.hittime` in root and Helper caller contexts,
apply its official fresh default, preserve live ModifyHitDef omission, and feed
accepted grounded hits plus `GetHitVar(hittime)`.

## Source gate

M.U.G.E.N 1.1 defines `ground.hittime` as an integer expression with a fresh
default of zero. Pinned Ikemen GO evaluates it when the HitDef runs, copies it
to the receiver get-hit payload, and lets ModifyHitDef replace the live value.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1584-1585`
- pinned Ikemen `compiler_functions.go:2017-2020`
- pinned Ikemen `bytecode.go:7735-7736`, `8332-8351`
- pinned Ikemen `char.go:685-824`, `11050`, `11062`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission resets an adversarial prior value to zero.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replaces an authored value and omission
  preserves the live value.
- Feed accepted grounded hits, receiver hit stun, and `GetHitVar(hittime)`.
- Add one required imported trace for `ground.hittime = var(0)` with `var(0)=13`,
  target memory, and Common1 branch evidence.

## Claim ceiling

Do not claim `ground.slidetime`, guard/air/down timers, Projectile or
ModifyProjectile, exact negative-time behavior, exact countdown phase, teams,
rollback, or full contact timing parity.

## Closeout evidence

- Compiler and HitDef coverage passes 152/152; the required trace focal passes.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-ground-hittime.json` passes
  with checksum `b1d162f8`: caller `var(0)=13` reaches accepted contact,
  target 77, `GetHitVar(hittime)=13`, and P2 state 5093.
- Aggregate trace QA passes 724/724, including 690 required artifacts.
- Full suite passes 3603/3661; the remaining 58 failures are the inherited
  deleted/stale legacy-roster expectations outside this cut.
