# Issue 220 — Dynamic direct HitDef forcenofall

- Status: `closed-bounded`
- Lane: `R1 direct fall-state policy`
- Priority: `P1`

## Objective

Resolve direct HitDef `forcenofall` in root and Helper caller contexts,
preserve live values through root or redirected `ModifyHitDef`, and clear the
receiver's falling flag on accepted hits without discarding the remaining fall
payload.

## Source gate

M.U.G.E.N 1.1 defines a boolean defaulting to zero that forces P2 out of fall,
except when the current HitDef also sets effective `fall = 1`. Pinned Ikemen
GO compiles/evaluates it as a caller-context boolean, reuses the evaluator for
`ModifyHitDef`, clears the pending fall flag, and then applies effective
air/ground fall policy.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:197-198`
- pinned Ikemen `compiler_functions.go:1906-1907`
- pinned Ikemen `bytecode.go:7651-7652`, `8339+`
- pinned Ikemen `char.go:10965`, `11030-11055`
- local Projectile precedent `ProjectileCombatSystem.ts`

## Acceptance fixture

- Compile static/dynamic values and reject malformed expressions.
- Resolve root and Helper caller expressions; preserve omitted live fields and
  replace supplied root or redirected `ModifyHitDef` values.
- Prove accepted direct hit clears a pre-existing falling flag while preserving
  fall payload.
- Prove effective `fall = 1` wins and guard does not consume the flag.
- Add one required imported trace with VarSet-derived `forcenofall = 1` and
  final `hitFall.falling = false` evidence.

## Claim ceiling

Do not claim new Projectile/ModifyProjectile work, ReversalDef, exact guard or
fall tick order, full Common1 recovery/bounce, Helper-owned `ModifyHitDef`,
teams, rollback, or full fall parity.

## Closure evidence

- Focused compiler, HitDef, direct-contact, Helper, redirected ModifyHitDef,
  and imported-trace coverage passes 205 tests.
- Typecheck, the 363-module production build, runtime boundaries, and
  redirected-dispatch boundaries pass.
- Required trace `synthetic-imported-hitdef-dynamic-forcenofall` passes with
  checksum `9d4b53d7`; aggregate trace QA passes 718/718 (684 required).
- The full suite passes 3577/3635; the remaining 58 failures are the inherited
  missing/stale legacy-roster expectations outside this runtime slice.
