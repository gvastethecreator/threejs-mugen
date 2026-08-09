# Issue 221 — Dynamic direct HitDef p2facing

- Status: `closed-bounded`
- Lane: `R1 direct facing policy`
- Priority: `P1`

## Objective

Resolve direct HitDef `p2facing` in root and Helper caller contexts, preserve
or replace it through root or redirected `ModifyHitDef`, and apply the authored
direction to the defender after an accepted unguarded hit while retaining
`GetHitVar(facing)` metadata.

## Source gate

M.U.G.E.N 1.1 defines positive `p2facing` as P2 facing the same direction as
P1, negative as the opposite direction, and zero or omission as no change.
Pinned Ikemen GO compiles it as an integer expression, evaluates it in caller
context, reuses the evaluator for `ModifyHitDef`, applies it only on a
successful non-guard contact, and consumes the pending facing change later in
the actor update.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:161-162`
- pinned Ikemen `compiler_functions.go:1985-1986`
- pinned Ikemen `bytecode.go:7713-7714`, `8338-8351`
- pinned Ikemen `char.go:11526-11540`, `11926-11927`

## Acceptance fixture

- Compile static and dynamic direct values and reject malformed expressions.
- Resolve root and Helper caller expressions; preserve omitted live fields and
  replace supplied root or redirected `ModifyHitDef` values, including zero.
- Prove positive and negative directions reach the defender through a one-shot
  deferred facing update; zero and guard contact leave facing unchanged.
- Preserve authored `GetHitVar(facing)` metadata on accepted hits.
- Add one required imported trace with VarSet-derived `p2facing` and observable
  final defender facing.

## Claim ceiling

Do not claim Projectile/ModifyProjectile, ReversalDef, exact parity for every
deferred-update ordering edge, noautoturn, custom-state or team topology,
rollback, or global facing parity.

## Closure evidence

- Focused compiler, HitDef, direct-contact, Helper, redirected ModifyHitDef,
  Playable runtime, and imported-trace coverage passes 281 tests.
- Typecheck, the 363-module production build, runtime boundaries, and
  redirected-dispatch boundaries pass.
- Required trace `synthetic-imported-hitdef-dynamic-p2facing` passes with
  checksum `e954df15`; aggregate trace QA passes 719/719 (685 required).
- The full suite passes 3581/3639; the remaining 58 failures are the inherited
  missing/stale legacy-roster expectations outside this runtime slice.
