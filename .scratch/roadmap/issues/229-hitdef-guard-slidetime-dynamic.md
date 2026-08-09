# Issue 229 — Dynamic direct HitDef guard.slidetime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `guard.slidetime` in root and Helper caller contexts,
derive fresh omission from the effective `guard.hittime`, preserve live
ModifyHitDef omission, and feed accepted guard timers plus
`GetHitVar(slidetime)`.

## Source gate

M.U.G.E.N 1.1 defines `guard.slidetime` as one integer expression for guarded
ground contact. Fresh omission derives from `guard.hittime`. Pinned Ikemen GO
evaluates the expression in caller context and lets ModifyHitDef replace only
the live guard slide value.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1581-1583`
- pinned Ikemen `compiler_functions.go:2057-2063`
- pinned Ikemen `bytecode.go:7803-7808`, `8332-8355`
- pinned Ikemen `char.go:587-593`, `731-735`, `875-888`, `10973-10987`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission derives from the effective T654 `guard.hittime`.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replacement and omission preservation
  without rederiving `guard.ctrltime`.
- Feed accepted guard timer metadata and `GetHitVar(slidetime)`.
- Add one required imported guard trace for `guard.slidetime = var(0)` with
  `var(0)=6`, target 77, and a Common1 readback branch.

## Claim ceiling

Do not claim dynamic `guard.ctrltime`, air-guard timing, negative or overflow
parity, exact countdown phase, Projectile or ModifyProjectile, physical slide
or friction parity, teams, rollback, or full guard timing parity.

## Closeout evidence

- Compiler, HitDef, direct-contact, and trace coverage passes 920/920.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-guard-slidetime.json`
  passes with checksum `fd7f5334`: `var(0)=6` reaches a real guard, target 77,
  and the Common1 `GetHitVar(slidetime)=6` branch.
- Aggregate trace QA passes 727/727, including 693 required artifacts.
