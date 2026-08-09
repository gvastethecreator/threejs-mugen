# Issue 218 — Direct HitDef force posture

- Status: `closed-bounded`
- Lane: `R1 direct get-hit posture`
- Priority: `P1`

## Objective

Resolve direct HitDef `forcestand` and Ikemen `forcecrouch` in root and Helper
caller contexts. Preserve live values through root or redirected
`ModifyHitDef`, and apply the effective posture only to accepted unguarded
direct hits that use the default get-hit state.

## Source gate

M.U.G.E.N 1.1 documents `forcestand` and its omitted default from nonzero
`ground.velocity.y`. Pinned Ikemen GO also compiles `forcecrouch`, evaluates
both in caller context, and reuses the same evaluator for `ModifyHitDef`.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:173-174`
- pinned Ikemen `compiler_functions.go:1898-1904`
- pinned Ikemen `bytecode.go:7647-7650`
- pinned Ikemen `char.go:914-915`, `10995-11002`, `12464-12468`
- local Projectile posture consumer `RuntimeCombatResolutionSystem.ts`

## Acceptance fixture

- Compile static and dynamic values and reject malformed expressions.
- Resolve root and Helper caller expressions.
- Preserve omitted fields and replace supplied fields through root or
  redirected `ModifyHitDef`.
- Preserve explicit `forcestand = 0` against the nonzero-Y default.
- Route crouching targets to standing get-hit, standing targets to crouching
  get-hit, and leave airborne targets unchanged.
- Add one required imported trace where dynamic `forcestand` selects state
  `5000` instead of crouching state `5010`.

## Claim ceiling

Do not call `forcecrouch` a M.U.G.E.N 1.1 feature. Do not claim new Projectile
or ModifyProjectile work, guard/air/lying/KO parity, dynamic custom-state
numbers, Helper-owned `ModifyHitDef`, exact tick order, teams, rollback, or
full get-hit parity.

## Closure evidence

- Root and Helper HitDef resolve both flags in caller context; root or
  redirected `ModifyHitDef` replaces them independently.
- Fresh omitted `forcestand` follows nonzero `ground.velocity.y`; explicit
  zero wins. Accepted direct hits apply the flags only to default get-hit
  posture selection, while guard, air, and custom P2 state routes stay intact.
- Focused coverage: 219 tests.
- Required trace: `synthetic-imported-hitdef-dynamic-force-posture`, checksum
  `4075d9df`, final checksum `44651ca4`.
- Typecheck, 363-module build, boundaries, redirect boundary, and 716/716
  traces pass. Full suite: 3564/3623; 58 inherited missing-roster failures plus
  one unrelated full-suite JSON read/write race that passes 6/6 in isolation.
