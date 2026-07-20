# Implementation report: HelperVar ownclsnscale

Date: 2026-07-20
Area: imported Helper expression context
Scope: T350, bounded `ownclsnscale` flag

## Result

The runtime now carries the Helper `ownclsnscale` flag from a typed Helper
controller operation into `RuntimeHelper`. `HelperVar(ownclsnscale)` reads
that flag in the active `ikemen-go` Helper context and returns zero for
legacy, unknown, root, or absent-flag contexts. The required imported
HelperVar trace now checks this sixth field with the existing route.

Ikemen also uses the flag in collision-scale selection. This slice keeps that
geometry behavior open and records only the typed state/read contract.

## Implementation

- `ControllerOps.ts` parses static finite values and supported scalar
  expressions into `ownClsnScale` metadata.
- `EffectSpawnSystem.ts` resolves dynamic values through the existing dispatch
  expression boundary, blocks unresolved values, and removes the field from
  non-Ikemen operations.
- `HelperSystem.ts` stores the resolved flag and passes it to the expression
  context.
- `ExpressionCompiler.ts` and `ExpressionEvaluator.ts` recognize the raw
  `ownclsnscale` HelperVar key while keeping unsupported keys closed.
- `RuntimeTraceGatePresets.ts` authors `ownclsnscale = 1` and requires
  `HelperVar(ownclsnscale) = 1` in the imported route.

## Evidence

- Feature commit: `9f0ecd65`.
- Focused affected modules: `747/747` tests.
- Full suite: `239/239` files, `2599/2599` tests.
- Required trace corpus: `634/634`, with `600` required and `34` optional
  artifacts.
- TypeScript 7 typecheck, build (`326` modules), and boundaries: passed.

The existing jsdom canvas warning and Vite large-chunk warning remain. The
browser gate is deferred for this runtime-only change.

## Claim ceiling

The evidence covers the current Helper-local boolean read and its required
imported trace. It does not cover collision-scale selection, hitbox/body-push
geometry, visual scale, nested or redirected Helpers, unsupported HelperVar
fields, or full MUGEN/IKEMEN parity.

## Primary sources

- [Ikemen-GO `char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
- [Ikemen-GO `bytecode.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
