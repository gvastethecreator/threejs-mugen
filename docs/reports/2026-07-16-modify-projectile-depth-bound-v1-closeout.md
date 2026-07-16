# ModifyProjectile ProjDepthBound v1 Closeout

Date: 2026-07-16
Slice: Wayfinder 213
Commit: `f6b2a227`

## Result

`ModifyProjectile` now accepts static and dynamic `projdepthbound` values. The
compiler and runtime reuse the existing operation/resolver path, normalize
finite values to the non-negative runtime policy, and mutate only selected
active projectiles. Missing parameters are no-ops; removed and terminal
projectiles remain unchanged.

The slice does not widen redirected destination, team, collision, render,
cancel, rollback, or complete ModifyProjectile parameter claims.

## Evidence

| Area | Result |
| --- | --- |
| Focused tests | `118/118` passed across compiler, projectile, effect-spawn, and helper suites |
| TypeScript 7 | `pnpm typecheck` passed |
| Full tests | `216/216` files, `2282/2282` tests passed |
| Production build | Passed; known large-chunk warning remains |
| Module boundaries | `pnpm check:boundaries` passed |
| Trace QA | `633/633` artifacts passed, `0` skipped |

Trace artifacts: `.scratch/qa/trace-gates`.

## Source basis

- [IKEMEN `compiler_functions.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/compiler_functions.go)
- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN changed controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#projectile-parameters)
- `docs/research/2026-07-16-modify-projectile-depth-bound.md`

## Claim ceiling

This closes the typed/runtime `ModifyProjectile` depth-bound mutation path under
the existing owner/id selection model. It does not establish complete
MUGEN/IKEMEN parameter parity or any deferred rendering, collision, redirect,
cancel, rollback, or netplay behavior.
