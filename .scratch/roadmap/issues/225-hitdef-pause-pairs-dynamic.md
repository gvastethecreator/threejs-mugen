# Issue 225 — Dynamic direct HitDef pause pairs

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `pausetime` and `guard.pausetime` pairs in root and
Helper caller contexts and apply their attacker/defender components
independently on accepted hit and guard contact.

## Source gate

M.U.G.E.N 1.1 defines both parameters as one or two integer expressions. A
fresh omitted `pausetime` is 0,0; one component is x,0. Omitted guard pause
inherits the normal pair, while a one-component guard pair replaces its first
component and keeps the normal defender component. Pinned Ikemen GO evaluates
components independently and consumes component zero as P1 pause and
component one as P2 hit-shake time.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1521-1530`
- pinned Ikemen `compiler_functions.go:2041-2047`
- pinned Ikemen `char.go:685-824`, `875-876`, `10939-10941`, `10976`, `10997`, `13479-13496`
- pinned Ikemen `bytecode.go:7777-7786`

## Acceptance fixture

- Compile literal/dynamic one/two-component pairs and reject malformed input.
- Prove fresh normal defaults 0,0; one x,0; two x,y.
- Prove guard omission inherits normal, one component g,normalY, and two g,h.
- Resolve root and Helper caller expressions.
- Apply component zero to the attacker and component one to defender hit pause
  and `GetHitVar(hitshaketime)` on hit and guard.
- Preserve legacy native DemoMove scalar behavior when pair metadata is absent.
- Add one required imported trace for `pausetime = 3,7` with actor pause and
  Common1 GetHitVar branch evidence.

## Claim ceiling

Do not claim ModifyHitDef, Projectile/ModifyProjectile, exact negative pause
behavior, ignorehitpause ordering, pause stacking, teams, rollback, or full
contact timing parity.

## Closeout evidence

- Compiler, HitDef, combat, Helper, and trace-focused coverage passes 1015/1015.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-pausetime.json` passes with
  checksum `764f1808`: P1 branches on `HitPauseTime = 3`, P2 branches on
  `GetHitVar(hitshaketime) = 7`, and target 77 is retained.
- Aggregate trace QA passes 723/723, including 689 required artifacts.
