# Issue 227 — Dynamic direct HitDef ground.slidetime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `ground.slidetime` in root and Helper caller contexts,
apply its official fresh default, preserve live ModifyHitDef omission, and copy
the accepted grounded-hit value into `GetHitVar(slidetime)`.

## Source gate

M.U.G.E.N 1.1 defines `ground.slidetime` as one integer expression for grounded
hits with a fresh default of zero. Pinned Ikemen GO evaluates it in caller
context, copies it to the receiver get-hit payload, and lets ModifyHitDef
replace the live value.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1576-1580`
- pinned Ikemen `compiler_functions.go:2057-2060`
- pinned Ikemen `bytecode.go:7803-7804`, `8332-8351`
- pinned Ikemen `char.go:587`, `685-824`, `10998`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission resets an adversarial prior value to zero.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replacement and omission preservation.
- Copy accepted grounded-hit metadata into receiver `GetHitVar(slidetime)`.
- Add one required imported trace for `ground.slidetime = var(0)` with
  `var(0)=9`, target 77, and a Common1 readback branch.

## Claim ceiling

Do not claim physical slide movement, automatic state exit, exact countdown or
tick phase, guard timing, air/down timing, negative values, Projectile or
ModifyProjectile, teams, rollback, or full contact timing parity.

## Closeout evidence

- Compiler, HitDef, and direct-contact coverage passes 216/216; the required
  trace focal passes.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-ground-slidetime.json`
  passes with checksum `0f6fdb82`: caller `var(0)=9` reaches accepted grounded
  contact, target 77, `GetHitVar(slidetime)=9`, and P2 state 5092.
- Aggregate trace QA passes 725/725, including 691 required artifacts.
- Full suite passes 3606/3664; the remaining 58 failures are the inherited
  deleted/stale legacy-roster expectations outside this cut.
