# Issue 211 — HitDef dynamic fall flags

- Status: `closed-bounded`
- Lane: `R1 fall/get-hit precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `fall`, `air.fall`, and `fall.kill` in root and Helper
caller contexts, and support component-wise root or redirected `ModifyHitDef`
replacement before accepted contact transfers the live fall policy.

## Source gate

M.U.G.E.N 1.1 documents all three fields. Pinned Ikemen GO compiles them as
HitDef booleans and `ModifyHitDef` reuses the live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:176-177`, `194-195`, `227-228`
- pinned Ikemen `hitDef_fall`, `hitDef_air_fall`, and `hitDef_fall_kill`
- pinned Ikemen `ModifyHitDef` live `hitDef.runSub` path

## Acceptance fixture

- Compile and resolve dynamic fall, air-fall, and fall-kill values in root and
  Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace only supplied live fields.
- Preserve accepted-hit transfer into `HitFall`, `GetHitVar(fall)`, and
  `GetHitVar(fall.kill)` consumers.
- Add one required imported trace with authored dynamic values.

## Claim ceiling

Do not claim guard fall behavior, Projectile or ModifyProjectile changes,
fall-count arbitration, exact KO/ground-impact timing, Helper-owned
`ModifyHitDef`, ReversalDef, teams, rollback, or full Common1 fall parity.

## Closeout

- Typed HitDef and ModifyHitDef IR retain all three finite expressions.
- Root and Helper HitDef resolve values in the caller context.
- Root or redirected ModifyHitDef replaces only supplied live fields.
- Required trace `synthetic-imported-hitdef-dynamic-fall-flags.json` passes
  with checksum `571e29ee` and HitFall/GetHitVar evidence.
- Focused suites pass 183/183 plus the real RedirectID route. The full suite
  passes 3542/3600 with the same 58 inherited roster failures; typecheck,
  363-module build, 709/709 traces, boundaries, and redirect boundary pass.
