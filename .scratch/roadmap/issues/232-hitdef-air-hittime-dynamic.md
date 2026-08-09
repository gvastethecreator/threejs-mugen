# Issue 232 — Dynamic direct HitDef air.hittime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `air.hittime` in root and Helper caller contexts, apply
the official fresh default 20, preserve live ModifyHitDef omission, and feed
accepted airborne non-fall stun plus `GetHitVar(hittime)`.

## Source gate

M.U.G.E.N 1.1 defines `air.hittime` as one integer expression for a receiver
hit in or toward the air, with fresh default 20 and no effect when `fall=1`.
Pinned Ikemen GO evaluates it in caller context and lets ModifyHitDef replace
the live value.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1589-1592`
- pinned Ikemen `compiler_functions.go:1989-1992`
- pinned Ikemen `bytecode.go:7715-7716`, `8332-8351`
- pinned Ikemen `char.go:685-824`, `11013-11062`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission uses 20 without inheriting an active move.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replacement and omission preservation.
- Feed accepted airborne non-fall stun and `GetHitVar(hittime)` while ground
  timing remains distinct and fall contact stays outside the claim.
- Add one required imported airborne-hit trace for `air.hittime = var(0)` with
  `var(0)=16`, target 77, and a Common1 readback branch.

## Claim ceiling

Do not claim exact countdown, landing or air physics, grounded receivers
launched into air, negative or overflow parity, Projectile or ModifyProjectile,
teams, rollback, or full airborne hit timing parity.

## Closeout evidence

- Compiler, HitDef, and direct-contact coverage passes 230/230.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-air-hittime.json` passes
  with checksum `0fbe2966`: `var(0)=16` reaches an airborne non-fall hit,
  target 77, and the imported `GetHitVar(hittime)=16` branch while the
  adversarial ground value remains distinct.
- Aggregate trace QA passes 730/730, including 696 required artifacts.
- Full suite executes 3624/3683. All 59 failures remain deleted/stale roster
  expectations outside this cut.
