# Implementation report: HelperVar ownpal

Date: 2026-07-20
Area: imported Helper expression context
Scope: T348, bounded Ikemen `ownpal` state

## Result

The runtime now carries the Helper `ownpal` flag from a typed Helper
controller operation into `RuntimeHelper`. `HelperVar(ownpal)` reads that
flag in the active `ikemen-go` Helper context and returns zero for legacy,
unknown, root, or absent-flag contexts. The required imported HelperVar trace
now checks this fourth field with the existing `helpertype`, `id`, `keyctrl`,
and `ownprojectile` route.

## Implementation

- `ControllerOps.ts` parses static finite values and supported scalar
  expressions into `ownPalette` metadata.
- `EffectSpawnSystem.ts` resolves dynamic values through the existing
  dispatch expression boundary, blocks unresolved values, and removes the
  field from non-Ikemen operations.
- `HelperSystem.ts` stores the resolved flag and passes it to the expression
  context.
- `ExpressionCompiler.ts` and `ExpressionEvaluator.ts` recognize the raw
  `ownpal` HelperVar key while keeping unsupported keys closed.
- `RuntimeTraceGatePresets.ts` authors `ownpal = 1` and requires
  `HelperVar(ownpal) = 1` in the imported route.

## Evidence

- Feature commit: `c8488e69`.
- Focused affected modules: `745/745` tests.
- Full suite: `239/239` files, `2597/2597` tests.
- Required trace corpus: `634/634`, with `600` required and `34` optional
  artifacts.
- TypeScript 7 typecheck, build (`326` modules), and boundaries: passed.

The existing jsdom canvas warning and Vite large-chunk warning remain. The
browser gate is deferred for this runtime-only change.

## Claim ceiling

The evidence covers a normal imported Helper and the boolean ownership read.
It does not cover palette allocation, remap application, PalFX, visual output,
other effect kinds, nested or redirected Helpers, unsupported HelperVar fields,
or full MUGEN/IKEMEN parity.

## Primary sources

- [Ikemen-GO `char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
- [Ikemen-GO `bytecode.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
