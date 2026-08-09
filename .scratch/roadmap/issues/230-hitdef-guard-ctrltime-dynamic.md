# Issue 230 — Dynamic direct HitDef guard.ctrltime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `guard.ctrltime` in root and Helper caller contexts,
derive fresh omission from effective `guard.slidetime`, preserve live
ModifyHitDef omission, and feed accepted guard control metadata plus
`GetHitVar(ctrltime)`.

## Source gate

M.U.G.E.N 1.1 defines `guard.ctrltime` as one integer expression for ground
guard control recovery. Fresh omission derives from `guard.slidetime`. Pinned
Ikemen GO evaluates the expression in caller context and lets ModifyHitDef
replace only the live ground-guard control value.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1593-1595`
- pinned Ikemen `compiler_functions.go:2061-2071`
- pinned Ikemen `bytecode.go:7805-7810`, `8332-8355`
- pinned Ikemen `char.go:592-593`, `731-735`, `875-888`, `10973-10987`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission derives from effective T655 `guard.slidetime`.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replacement and omission preservation
  without rederiving `airguard.ctrltime`.
- Feed accepted ground-guard timer metadata and `GetHitVar(ctrltime)`.
- Add one required imported guard trace for `guard.ctrltime = var(0)` with
  `var(0)=8`, target 77, and a Common1 readback branch.

## Claim ceiling

Do not claim exact control-return countdown or tick phase, dynamic
`airguard.ctrltime`, negative or overflow parity, Projectile or
ModifyProjectile, physical slide or friction parity, teams, rollback, or full
guard timing parity.

## Closeout evidence

- Compiler, HitDef, direct-contact, and trace coverage passes 924/924.
- Typecheck passes.
- Required trace `synthetic-imported-hitdef-dynamic-guard-ctrltime.json`
  passes with checksum `4bc6e574`: `var(0)=8` reaches a real ground guard,
  target 77, and the Common1 `GetHitVar(ctrltime)=8` branch.
- Aggregate trace QA passes 728/728, including 694 required artifacts.
