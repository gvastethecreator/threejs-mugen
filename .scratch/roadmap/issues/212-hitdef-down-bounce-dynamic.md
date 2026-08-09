# Issue 212 — HitDef dynamic down bounce

- Status: `closed-bounded`
- Lane: `R1 fall/get-hit precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `down.bounce` in root and Helper caller contexts, and
support root or redirected `ModifyHitDef` replacement before accepted contact
transfers the live bounce policy.

## Source gate

M.U.G.E.N 1.1 documents `down.bounce` as an optional boolean. Pinned Ikemen GO
compiles it as `VT_Bool` and `ModifyHitDef` reuses the live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:206-207`
- pinned Ikemen `hitDef_down_bounce`
- pinned Ikemen `ModifyHitDef` live `hitDef.runSub` path

## Acceptance fixture

- Compile and resolve dynamic `down.bounce` in root and Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace the live value.
- Preserve accepted-hit transfer into the existing HitFall ground-bounce path.
- Add one required imported trace with an authored dynamic value.

## Claim ceiling

Do not claim exact bounce geometry or timing, zero-Y suppression breadth,
Projectile or ModifyProjectile changes, Helper-owned `ModifyHitDef`, repeated
fall-count arbitration, teams, rollback, or full Common1 bounce parity.

## Verification

- Focused compiler, HitDef, Helper, and trace coverage: 186 passing tests plus
  the real root `RedirectID` route.
- Full suite: 3545/3603 passing with the same 58 inherited roster failures.
- Production build: 363 modules.
- Required trace: `synthetic-imported-hitdef-dynamic-down-bounce`, checksum
  `d2ba2261`, final defender `HitFall.downBounce=true`.
- Aggregate traces: 710/710 (676 required, 34 optional).
- Typecheck, boundaries, and redirected-dispatch boundary pass.
