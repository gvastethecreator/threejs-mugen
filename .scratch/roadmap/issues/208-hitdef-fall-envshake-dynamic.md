# Issue 208 — HitDef fall EnvShake dynamic mutation

- Status: `closed-bounded`
- Lane: `R2 HitDef presentation consequences`
- Priority: `P1`

## Objective

Carry dynamic direct HitDef `fall.envshake.time/freq/ampl/phase` through root
and Helper caller contexts, support live root or redirected `ModifyHitDef`
replacement, and keep the existing ground-impact camera-shake path.

## Source gate

M.U.G.E.N 1.1 documents the four fall EnvShake fields inside HitDef. Pinned
Ikemen GO also compiles `fall.envshake.mul` and `fall.envshake.dir`, and
`ModifyHitDef` reuses the live HitDef parameter evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:269-276`
- pinned Ikemen `hitDefSub` fall EnvShake parameters
- pinned Ikemen `ModifyHitDef` live `hitDef.runSub` path

## Acceptance fixture

- Compile and resolve the four M.U.G.E.N fields plus bounded Ikemen `mul` and
  `dir` in root and Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace only supplied live fields.
- Preserve the existing accepted-hit metadata and later `FallEnvShake` camera
  emission when the receiver reaches the ground-impact route.
- Add one required imported trace for dynamic authored values.

## Claim ceiling

Do not claim `diradd`, `decay`, exact local-coordinate amplitude conversion,
all ground-impact timing, Helper-owned `ModifyHitDef`, ReversalDef,
ModifyProjectile changes, teams, rollback, or full fall presentation parity.

## Closeout evidence

- Typed root/Helper HitDef and root or redirected `ModifyHitDef` expressions
  resolve component-wise with fresh defaults and live-field preservation.
- Focused compiler/runtime/Helper/FallEnvShake coverage passes 189/189; the
  real redirected mutation route passes 1/1.
- Required artifact `synthetic-imported-hitdef-dynamic-fall-envshake` passes
  with checksum `dcdb8f61`; aggregate trace coverage is 706/706 (672 required,
  34 optional).
- Full suite is 3533/3591 with the same 58 inherited removed-roster failures.
  Typecheck, 363-module build, boundaries, redirect boundary, and diff hygiene
  pass.
