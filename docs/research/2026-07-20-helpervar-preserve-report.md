# Implementation report: HelperVar preserve

Date: 2026-07-20
Area: imported Helper expression context
Scope: T349, bounded `preserve` flag

## Result

The runtime now carries the Helper `preserve` flag from a typed Helper
controller operation into `RuntimeHelper`. `HelperVar(preserve)` reads that
flag in the active `ikemen-go` Helper context and returns zero for legacy,
unknown, root, or absent-flag contexts. The required imported HelperVar trace
now checks this fifth field with the existing route.

The upstream flag also controls Helper retention during round-start backup and
destruction. That lifecycle behavior remains open in the port and is called
out instead of being implied by the new read.

## Implementation

- `ControllerOps.ts` parses static finite values and supported scalar
  expressions into `preserve` metadata.
- `EffectSpawnSystem.ts` resolves dynamic values through the existing dispatch
  expression boundary, blocks unresolved values, and removes the field from
  non-Ikemen operations.
- `HelperSystem.ts` stores the resolved flag and passes it to the expression
  context.
- `ExpressionCompiler.ts` and `ExpressionEvaluator.ts` recognize the raw
  `preserve` HelperVar key while keeping unsupported keys closed.
- `RuntimeTraceGatePresets.ts` authors `preserve = 1` and requires
  `HelperVar(preserve) = 1` in the imported route.

## Evidence

- Feature commit: `4d2cb9c9`.
- Focused affected modules: `746/746` tests.
- Full suite: `239/239` files, `2598/2598` tests.
- Required trace corpus: `634/634`, with `600` required and `34` optional
  artifacts.
- TypeScript 7 typecheck, build (`326` modules), and boundaries: passed.

The existing jsdom canvas warning and Vite large-chunk warning remain. The
browser gate is deferred for this runtime-only change.

## Claim ceiling

The evidence covers the current Helper-local boolean read and its required
imported trace. It does not cover round-start backup, F4/reload, destruction
policy, persistence across new rounds, nested or redirected Helpers,
unsupported HelperVar fields, or full MUGEN/IKEMEN parity.

## Primary sources

- [Ikemen-GO `char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
- [Ikemen-GO `bytecode.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
- [Ikemen-GO `system.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
