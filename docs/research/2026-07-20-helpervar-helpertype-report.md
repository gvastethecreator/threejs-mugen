# Implementation report: HelperVar helpertype

Date: 2026-07-20
Area: imported Helper expression context
Scope: T347, normal Helper type

## Result

`HelperVar(helpertype)` now reads the typed normal-Helper value `1` in the
current Ikemen runtime profile. The existing required HelperVar trace checks
the field with `id`, `keyctrl`, and `ownprojectile`, so the new read has both
micro-VM and required-corpus evidence.

## Implementation

- `RuntimeHelper.helperType` is initialized to `1` by
  `createRuntimeHelper`.
- `helperExpressionContext` passes the field to the expression evaluator.
- `ExpressionCompiler` preserves `helpertype` as a raw symbolic HelperVar
  argument and the evaluator returns the typed value.
- `RuntimeTraceGatePresets.ts` adds the field to the imported branch and keeps
  the profile explicit as `ikemen-go`.

## Evidence

- Feature commit: `7700e618`.
- Focused affected modules: `731/731` tests.
- Full suite: `239/239` files, `2596/2596` tests.
- Required trace corpus: `634/634`, with `600` required and `34` optional.
- TypeScript 7 typecheck, build (`326` modules), and boundaries: passed.

The existing jsdom canvas warning and Vite large-chunk warning remain. The
browser gate is deferred for this runtime-only change.

## Claim ceiling

The evidence covers the normal imported Helper value `1`. It does not cover
player/projectile HelperType variants, nested Helpers, redirected contexts,
the other upstream fields, or full MUGEN/IKEMEN parity.

## Primary sources

- [Ikemen-GO `char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
- [Ikemen-GO `bytecode.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)

