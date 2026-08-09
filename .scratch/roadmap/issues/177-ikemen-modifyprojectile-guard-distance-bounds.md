# Issue 177 — Ikemen ModifyProjectile guard-distance bounds

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port the complete Projectile guard-distance bounds used by Ikemen GO:
`guard.dist`, `guard.dist.width`, `guard.dist.height`, and
`guard.dist.depth`. Each parameter accepts one or two values.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` maps old `guard.dist` and new
`guard.dist.width` to the X pair. Height and depth use separate pairs. A
missing second value becomes zero. Negative values do not replace the current
component. Projectile `InGuardDist` checks front/back, top/bottom, and depth
bounds against the live Projectile HitDef.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_guard_dist_x/y/z` and ModifyProjectile dispatch
- `src/char.go`: Projectile guard-distance admission

## Port ledger

| Item | Decision |
| --- | --- |
| Old `guard.dist` X alias | copy |
| New width, height, and depth pairs | copy |
| Omitted second value becomes zero | copy |
| Negative component preserves the live value | copy |
| Selected live Projectile mutation | copy |
| Local 2D/2.5D `InGuardDist` consumer | adapt to current runtime coordinates |

## Acceptance fixture

- Compile all four static pair forms.
- Resolve bounded dynamic root and helper pairs.
- Preserve live components for negative values.
- Mutate only selected live Projectiles.
- Prove front/back and vertical/depth admission through the guard-distance
  world.

## Claim ceiling

Do not claim exact localcoord scaling, direct HitDef guard-distance migration,
full 3D collision parity, exact guard-start tick order, rollback serialization,
or full Projectile parity.

## Verification

- Focused compiler/runtime/guard tests: `132/132` passed.
- Isolated root and helper dynamic consumers: `1/1` passed each.
- Full suite: `3426/3484` passed with the same 58 inherited failures.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace`, boundaries, redirect
  boundary, and `git diff --check` passed.
- Trace corpus: `686/686` artifacts passed (`652` required, `34` optional).
