# Issue 231 — Dynamic direct HitDef airguard.ctrltime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `airguard.ctrltime` in root and Helper caller contexts,
derive fresh omission from effective `guard.ctrltime`, preserve live
ModifyHitDef omission, and feed accepted air-guard control metadata plus
`GetHitVar(ctrltime)`.

## Source gate

M.U.G.E.N 1.1 defines `airguard.ctrltime` as one integer expression for air
guard control recovery. Fresh omission derives from `guard.ctrltime`. Pinned
Ikemen GO evaluates the expression in caller context and selects the air value
only when the guarded receiver is airborne.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1649-1651`
- pinned Ikemen `compiler_functions.go:2065-2071`
- pinned Ikemen `bytecode.go:7807-7810`, `8332-8355`
- pinned Ikemen `char.go:592-593`, `734-735`, `887-888`, `10973-10987`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission derives from effective T656 `guard.ctrltime`.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replacement and omission preservation
  without changing ground `guard.ctrltime`.
- Feed accepted air-guard control metadata and `GetHitVar(ctrltime)` while a
  ground guard still selects the ground value.
- Add one required imported air-guard trace for
  `airguard.ctrltime = var(0)` with `var(0)=12`, target 77, and a Common1
  readback branch.

## Claim ceiling

Do not claim exact air-guard control return, landing or countdown phase, other
dynamic air-guard fields, negative or overflow parity, Projectile or
ModifyProjectile, teams, rollback, or full guard timing parity.

## Closeout evidence

- Compiler, HitDef, and direct-contact coverage passes 227/227.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-airguard-ctrltime.json`
  passes with checksum `f0e5904e`: `var(0)=12` reaches a real airborne guard,
  target 77, and the imported `GetHitVar(ctrltime)=12` branch while ground
  guard states remain forbidden.
- Aggregate trace QA passes 729/729, including 695 required artifacts.
- Full suite executes 3620/3679. All 59 failures are deleted/stale roster
  expectations outside this cut; the extra failure over the previous run is a
  concurrent stale `Nova Boxer` log assertion.
