# Research: IKEMEN ModifyProjectile ProjDepthBound

Date: 2026-07-16
Status: implementation completed (Wayfinder 213)

## Question

Does IKEMEN's `ModifyProjectile` accept `projdepthbound`, and can the current
port add it without widening projectile ownership or collision behavior?

## Primary sources

- [IKEMEN `compiler_functions.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/compiler_functions.go)
- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN changed controller documentation: `ProjDepthBound`](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#projectile-parameters)

## Findings

The official compiler's `modifyProjectile` handler delegates to the shared
`projectileSub` parser. That shared parser registers `projdepthbound` alongside
`projstagebound`, `projedgebound`, and `projheightbound`, so the parameter is
authored on both creation and modification routes. The projectile model stores
the value as `depthbound`, and the active update consumes it when comparing the
projectile Z position against stage depth limits.

The repository already has the right bounded extension points: static
`ModifyProjectileControllerOp` fields, a `RuntimeModifyProjectileNumberParam`
union for dynamic resolution, and an active-projectile mutation loop that skips
removed or terminal actors. Adding only `depthBound` keeps selection, ownership,
collision, and render behavior unchanged.

## Decision

Add `depthBound?: number` to `ModifyProjectileControllerOp`. Resolve static
`projdepthbound` during compilation and dynamic values through the existing
`resolveNumber` callback. Normalize the value with the same finite,
non-negative policy used at projectile creation, then mutate active selected
projectiles. A missing parameter is a no-op; removed or terminal projectiles
remain immutable.

## Uncertainty and ceiling

This slice does not claim exact upstream diagnostics for invalid values, full
redirected destination coverage, or complete ModifyProjectile parameter parity.
It only closes the typed/runtime `projdepthbound` mutation path under the
existing owner and projectile-id selection contract.

## Implementation evidence

- `ModifyProjectileControllerOp.depthBound` now lowers static
  `projdepthbound` values.
- Dynamic `projdepthbound` resolves through the existing
  `RuntimeModifyProjectileNumberParam` callback used by root and helper
  dispatch.
- The active mutation loop applies normalized finite non-negative values only
  to selected live projectiles; removed and terminal actors are skipped.
- Focused tests: `118/118` passed; full suite: `216/216` files and
  `2282/2282` tests passed.
- TypeScript 7 typecheck, production build, boundary check, and trace QA all
  passed. Trace QA covered `633/633` artifacts with `0` skipped.
- Implementation commit: `f6b2a227`.
