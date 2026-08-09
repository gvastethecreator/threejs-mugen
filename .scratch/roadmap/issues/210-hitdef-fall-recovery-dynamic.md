# Issue 210 — HitDef dynamic fall recovery metadata

- Status: `closed-bounded`
- Lane: `R1 fall/get-hit precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `fall.recover`, `fall.recovertime`, `down.recover`, and
`down.recovertime` in root and Helper caller contexts, and support
component-wise root or redirected `ModifyHitDef` replacement before accepted
contact transfers the live recovery metadata.

## Source gate

M.U.G.E.N 1.1 documents fall recovery policy and delay. Pinned Ikemen GO
compiles both fall and down recovery fields as HitDef values, and
`ModifyHitDef` reuses the live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:185-189`
- pinned Ikemen `hitDefSub` fall/down recovery fields
- pinned Ikemen `ModifyHitDef` live `hitDef.runSub` path

## Acceptance fixture

- Compile and resolve dynamic fall/down recovery booleans and times in root and
  Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace only supplied live fields.
- Preserve accepted-hit transfer into `GetHitVar(fall.recover)`,
  `GetHitVar(fall.recovertime)`, and down-recovery aliases.
- Add one required imported trace with authored dynamic values.

## Claim ceiling

Do not claim exact recovery threshold/default tables, fast-recovery mashing,
ground/air arbitration, Helper-owned `ModifyHitDef`, ReversalDef,
ModifyProjectile changes, teams, rollback, or full Common1 recovery parity.

## Closeout

- Typed HitDef and ModifyHitDef IR retain all four finite expressions.
- Root and Helper HitDef resolve values in the caller context.
- Root or redirected ModifyHitDef replaces only supplied live fields.
- Required trace `synthetic-imported-hitdef-dynamic-fall-recovery.json` passes
  with checksum `b90e7fe3` and GetHitVar alias evidence.
- Focused suites pass 181/181 plus the real RedirectID route. The full suite
  passes 3539/3597 with the same 58 inherited roster failures; typecheck,
  363-module build, 708/708 traces, boundaries, and redirect boundary pass.
