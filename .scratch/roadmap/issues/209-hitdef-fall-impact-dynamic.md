# Issue 209 — HitDef dynamic fall impact metadata

- Status: `closed-bounded`
- Lane: `R1 fall/get-hit precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `fall.damage`, `fall.xvelocity`, and `fall.yvelocity` in
root and Helper caller contexts, include pinned Ikemen `fall.zvelocity`, and
support component-wise root or redirected `ModifyHitDef` replacement before
accepted contact transfers the live fall metadata.

## Source gate

M.U.G.E.N 1.1 documents `fall.xvelocity`, `fall.yvelocity`, and `fall.damage`.
Pinned Ikemen GO compiles those fields plus `fall.zvelocity` as HitDef values,
and `ModifyHitDef` reuses the live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:179-192`
- pinned Ikemen `hitDefSub` fall impact fields
- pinned Ikemen `ModifyHitDef` live `hitDef.runSub` path

## Acceptance fixture

- Compile and resolve dynamic impact damage and X/Y/Z velocity fields in root
  and Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace only supplied live fields.
- Preserve accepted-hit transfer into `GetHitVar(fall.damage/fall.xvel/fall.yvel)`
  and the existing ground-impact damage/bounce consumers.
- Add one required imported trace with authored dynamic values.

## Claim ceiling

Do not claim dynamic fall recovery fields, `fall.defence_up`, exact localcoord
velocity defaults, exact bounce/ground-impact timing, Helper-owned
`ModifyHitDef`, ReversalDef, ModifyProjectile changes, teams, rollback, or full
fall/get-hit parity.

## Closeout evidence

- Typed root/Helper HitDef expressions resolve impact damage and X/Y/Z
  velocity in caller context; root or redirected `ModifyHitDef` preserves
  omitted live components.
- Focused compiler/runtime/Helper coverage passes 179/179 plus the real
  RedirectID route.
- Required artifact `synthetic-imported-hitdef-dynamic-fall-impact` passes with
  checksum `c4a23ee8`; aggregate traces pass 707/707 (673 required, 34
  optional).
- Full suite is 3536/3594 with the same 58 inherited removed-roster failures.
  Typecheck, 363-module build, boundaries, and redirect boundary pass.
